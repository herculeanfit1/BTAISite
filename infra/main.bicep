// ── BTAI-Site Infrastructure ────────────────────────────────────────
// Provisions: Functions (Flex Consumption), Storage, App Insights,
//             Key Vault, SWA linked backend.
// Deploy:
//   az deployment group create \
//     --resource-group BTAI-RG1 \
//     --template-file infra/main.bicep \
//     --parameters infra/parameters.prod.json
// ────────────────────────────────────────────────────────────────────

targetScope = 'resourceGroup'

// ── Parameters ──────────────────────────────────────────────────────

@description('Primary Azure region')
param location string = 'eastus2'

@description('Environment name')
@allowed(['prod', 'staging'])
param environment string = 'prod'

@description('Name of the existing SWA resource')
param swaName string = 'bridgingtrust-website'

// ── Naming ──────────────────────────────────────────────────────────

var prefix = 'btai-site'
var suffix = environment
var names = {
  functions: 'func-${prefix}-${suffix}'
  storage: 'st${replace(prefix, '-', '')}${suffix}'
  appInsights: 'appi-${prefix}-${suffix}'
  logAnalytics: 'log-${prefix}-${suffix}'
  plan: 'plan-${prefix}-${suffix}'
  keyVault: 'kv-${prefix}-${suffix}'
}

// ── Log Analytics + Application Insights ────────────────────────────

resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: names.logAnalytics
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
  }
}

resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: names.appInsights
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalytics.id
    IngestionMode: 'LogAnalytics'
  }
}

// ── Storage Account (Functions runtime) ─────────────────────────────

resource storageAccount 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name: names.storage
  location: location
  kind: 'StorageV2'
  sku: {
    name: 'Standard_LRS'
  }
  properties: {
    supportsHttpsTrafficOnly: true
    minimumTlsVersion: 'TLS1_2'
    allowBlobPublicAccess: false
  }
}

resource blobService 'Microsoft.Storage/storageAccounts/blobServices@2023-05-01' = {
  parent: storageAccount
  name: 'default'
}

resource deployContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-05-01' = {
  parent: blobService
  name: 'deploymentpackages'
}

// ── Lead-classification queue ───────────────────────────────────────
// Live and in use: app/api/contact enqueues here for the downstream
// classification pipeline. It was created by hand, so the environment could not
// be rebuilt from this file until now (PLAN-011).
//
// Access is a queue-scoped, add-only SAS URL held in the Static Web App's
// CLASSIFY_QUEUE_SAS_URL setting — NOT the Functions managed identity. There is
// deliberately no "Storage Queue Data Message Sender" role assignment here and
// no AzureWebJobsStorage__queueServiceUri app setting: both belong to the
// retired Functions runtime and would grant a dead identity live queue access.

resource queueService 'Microsoft.Storage/storageAccounts/queueServices@2023-05-01' = {
  parent: storageAccount
  name: 'default'
}

resource classifyQueue 'Microsoft.Storage/storageAccounts/queueServices/queues@2023-05-01' = {
  parent: queueService
  name: 'btai-lead-classify'
}

// ── Functions App (Flex Consumption) ────────────────────────────────

resource plan 'Microsoft.Web/serverfarms@2024-04-01' = {
  name: names.plan
  location: location
  kind: 'functionapp'
  sku: {
    tier: 'FlexConsumption'
    name: 'FC1'
  }
  properties: {
    reserved: true
  }
}

resource functionsApp 'Microsoft.Web/sites@2024-04-01' = {
  name: names.functions
  location: location
  kind: 'functionapp,linux'
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    serverFarmId: plan.id
    httpsOnly: true
    siteConfig: {
      minTlsVersion: '1.2'
      appSettings: [
        {
          name: 'AzureWebJobsStorage__accountName'
          value: storageAccount.name
        }
        {
          name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
          value: appInsights.properties.ConnectionString
        }
        {
          name: 'FUNCTIONS_EXTENSION_VERSION'
          value: '~4'
        }
      ]
    }
    functionAppConfig: {
      runtime: {
        name: 'node'
        version: '22'
      }
      deployment: {
        storage: {
          type: 'blobContainer'
          value: '${storageAccount.properties.primaryEndpoints.blob}deploymentpackages'
          authentication: {
            type: 'SystemAssignedIdentity'
          }
        }
      }
      scaleAndConcurrency: {
        maximumInstanceCount: 10
        instanceMemoryMB: 2048
        alwaysReady: [
          {
            name: 'http'
            instanceCount: 1
          }
        ]
      }
    }
  }
}

// Grant Functions app Storage Blob Data Owner on storage account
resource storageBlobDataOwner 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(storageAccount.id, functionsApp.id, 'StorageBlobDataOwner')
  scope: storageAccount
  properties: {
    principalId: functionsApp.identity.principalId
    principalType: 'ServicePrincipal'
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', 'b7e6dc6d-f1e8-4753-8033-0f276bb0955b')
  }
}

// ── Key Vault ──────────────────────────────────────────────────────

resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: names.keyVault
  location: location
  properties: {
    tenantId: subscription().tenantId
    enableRbacAuthorization: true
    enableSoftDelete: true
    softDeleteRetentionInDays: 90
    enablePurgeProtection: true
    publicNetworkAccess: 'Enabled'
    sku: {
      family: 'A'
      name: 'standard'
    }
  }
}

// Grant Functions managed identity Key Vault Secrets User
resource kvSecretsUser 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(keyVault.id, functionsApp.id, 'KeyVaultSecretsUser')
  scope: keyVault
  properties: {
    principalId: functionsApp.identity.principalId
    principalType: 'ServicePrincipal'
    // Key Vault Secrets User
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '4633458b-17de-408a-b874-0445c86b69e6')
  }
}

// ── Static Web App (reference existing) ────────────────────────────

resource swa 'Microsoft.Web/staticSites@2024-04-01' existing = {
  name: swaName
}

// NO linked backend. Removed 2026-07-27 (PLAN-011).
//
// This template still declared `Microsoft.Web/staticSites/linkedBackends`
// pointing at the Functions app. That link was retired on 2026-07-24 when /api/*
// moved to App Router route handlers inside the Next.js app, and the SWA has no
// linked backend today (`az staticwebapp backends show` → []).
//
// Deploying this template as written would have RE-CREATED the link. Microsoft
// documents Function App linking as unsupported for hybrid Next.js, and
// cost-optimized-ci.yml's post-deploy check explicitly warns that re-linking is
// not the fix for a broken /api/*. So the one action this file invited — deploy
// it to reconcile drift — was the action that could break the live API.
//
// Do not reinstate. See docs/projects/API-CONSOLIDATION-PLAN-2026-07-24.md.

// ── Auth: allow anonymous — CORS handled in function code ──────────

resource authSettings 'Microsoft.Web/sites/config@2024-04-01' = {
  parent: functionsApp
  name: 'authsettingsV2'
  properties: {
    platform: {
      enabled: false
    }
    globalValidation: {
      unauthenticatedClientAction: 'AllowAnonymous'
    }
  }
}

// ── Outputs ─────────────────────────────────────────────────────────

output functionsAppName string = functionsApp.name
output functionsIdentityPrincipalId string = functionsApp.identity.principalId
output storageAccountName string = storageAccount.name
output appInsightsName string = appInsights.name
output keyVaultName string = keyVault.name
output keyVaultUri string = keyVault.properties.vaultUri
output swaDefaultHostname string = swa.properties.defaultHostname

// ── Post-Deployment Steps ───────────────────────────────────────────
//
// 1. Seed Key Vault secrets and wire KV references:
//    ./scripts/wire-functions-settings.sh
//
// 2. Deploy Functions code:
//    cd api && npm run build
//    func azure functionapp publish func-btai-site-prod --javascript
//
// 3. Verify:
//    curl https://func-btai-site-prod.azurewebsites.net/api/health
//    curl https://bridgingtrust.ai/api/health
