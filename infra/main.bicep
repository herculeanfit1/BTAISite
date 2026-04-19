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

// Link SWA backend to Functions app
resource swaBackend 'Microsoft.Web/staticSites/linkedBackends@2024-04-01' = {
  parent: swa
  name: 'functions-backend'
  properties: {
    backendResourceId: functionsApp.id
    region: location
  }
}

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
