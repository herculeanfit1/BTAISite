// ── BTAI-Site Infrastructure ────────────────────────────────────────
// Provisions: Storage (incl. the lead-classification queue), App Insights,
//             Log Analytics, Key Vault, and the lead-pipeline alerting.
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

@description('Address that receives operational alerts')
param alertEmail string = 'terence@bridgingtrust.ai'

@description('Public URL the availability tests probe')
param publicSiteUrl string = 'https://bridgingtrust.ai'

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

// ── NO Functions App ────────────────────────────────────────────────
//
// func-btai-site-prod and its Flex Consumption plan were deleted 2026-07-27
// (API-consolidation Phase 5). They had served no traffic since 2026-07-24,
// when /api/* moved to App Router route handlers inside the Next.js app.
//
// What deliberately REMAINS in this file, and why:
//   - Storage account: hosts btai-lead-classify, the LIVE queue production
//     writes to on every lead. Deleting it breaks the pipeline.
//   - App Insights + Log Analytics: the deployed availability alerting depends
//     on them.
//   - Key Vault: retained as the intended home for secrets. Nothing reads it
//     today — the Static Web App's settings are literal values, not
//     @Microsoft.KeyVault() references — which is a gap tracked in the roadmap,
//     not a reason to delete the vault.
//
// BTAI-RG1 is a SHARED resource group containing other projects' resources.
// Never tear down the group.





// NO role assignments for the Functions identity.
//
// Storage Blob Data Owner and Key Vault Secrets User already exist in Azure,
// created by hand under different GUIDs. Bicep names role assignments with
// guid(), so redeclaring them fails the whole deployment with
// RoleAssignmentExists — and `what-if` cannot read role assignments, so it
// reports them as Create and gives no warning. That combination failed the
// 2026-07-27 alerting deployment after the alerts themselves had been created.
//
// They are not redeclared because both grant access to func-btai-site-prod's
// managed identity, and that app is being deleted (API-consolidation Phase 5).
// The live app reaches storage with a queue-scoped SAS and holds its own
// settings; it uses neither role.

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



// ── Alerting ────────────────────────────────────────────────────────
// Nothing alerted anyone when the lead pipeline broke: no action groups, no
// alerts, no availability tests existed anywhere (verified against the live
// resource group, not assumed).
//
// WHAT IS DELIBERATELY ABSENT: PLAN-010 also asked for an Http5xx metric alert
// on the Functions app and an App Insights exceptions alert. Both would be
// PERMANENTLY SILENT and are therefore worse than nothing, because they look
// like coverage:
//   - The Functions app has served no traffic since 2026-07-24, so its Http5xx
//     metric is structurally always zero.
//   - The live compute is the SWA managed backend, and the Static Web App holds
//     only NEXT_PUBLIC_APPLICATIONINSIGHTS_CONNECTION_STRING — browser-side
//     telemetry. Nothing server-side emits exceptions to App Insights at all.
//
// Availability tests are used instead: they probe from outside and depend on no
// in-process instrumentation, so they work regardless of where the app runs.

resource alertActions 'Microsoft.Insights/actionGroups@2023-01-01' = {
  name: 'ag-${prefix}-${suffix}'
  location: 'global'
  properties: {
    groupShortName: 'btaiprod'
    enabled: true
    emailReceivers: [
      {
        name: 'ops-email'
        emailAddress: alertEmail
        useCommonAlertSchema: true
      }
    ]
  }
}

// Liveness: /api/health is the endpoint the post-deploy gate already trusts.
resource healthTest 'Microsoft.Insights/webtests@2022-06-15' = {
  name: 'wt-${prefix}-health'
  location: location
  tags: {
    // Required, or the test is orphaned from the App Insights resource.
    'hidden-link:${appInsights.id}': 'Resource'
  }
  properties: {
    SyntheticMonitorId: 'wt-${prefix}-health'
    Name: 'BTAI health endpoint'
    Enabled: true
    Frequency: 300
    Timeout: 30
    Kind: 'standard'
    RetryEnabled: true
    Locations: [
      { Id: 'us-ca-sjc-azr' }
      { Id: 'us-il-ch1-azr' }
      { Id: 'us-va-ash-azr' }
    ]
    Request: {
      RequestUrl: '${publicSiteUrl}/api/health'
      HttpVerb: 'GET'
    }
    ValidationRules: {
      ExpectedHttpStatusCode: 200
      SSLCheck: true
      SSLCertRemainingLifetimeCheck: 14
      ContentValidation: {
        ContentMatch: '"status"'
        IgnoreCase: false
        PassIfTextFound: true
      }
    }
  }
}

// Lead path: POSTs a deliberately INVALID payload and requires a 400. Zod
// rejects it before any email, CRM write or enqueue, so this exercises the real
// contact handler continuously without ever creating a lead. A health check
// alone cannot catch "the site is up but the form is broken", which is the
// failure that actually costs money.
resource contactTest 'Microsoft.Insights/webtests@2022-06-15' = {
  name: 'wt-${prefix}-contact'
  location: location
  tags: {
    'hidden-link:${appInsights.id}': 'Resource'
  }
  properties: {
    SyntheticMonitorId: 'wt-${prefix}-contact'
    Name: 'BTAI contact endpoint validates'
    Enabled: true
    Frequency: 900
    Timeout: 30
    Kind: 'standard'
    RetryEnabled: true
    Locations: [
      { Id: 'us-ca-sjc-azr' }
      { Id: 'us-va-ash-azr' }
    ]
    Request: {
      RequestUrl: '${publicSiteUrl}/api/contact'
      HttpVerb: 'POST'
      Headers: [
        { key: 'Content-Type', value: 'application/json' }
      ]
      RequestBody: base64('{"email":"not-an-email","message":""}')
      ParseDependentRequests: false
    }
    ValidationRules: {
      // 400 IS the healthy answer here — it proves the handler ran and
      // validated. An HTML 200 would mean the request fell through to the
      // static site instead of reaching the route handler.
      ExpectedHttpStatusCode: 400
      SSLCheck: true
    }
  }
}

// Webtest availability uses its own criteria type; the generic single-resource
// criteria rejects the (webtest + component) scope pair these alerts require.
resource healthAlert 'Microsoft.Insights/metricAlerts@2018-03-01' = {
  name: 'alert-${prefix}-health-availability'
  location: 'global'
  properties: {
    description: 'The public /api/health endpoint failed its availability test.'
    severity: 1
    enabled: true
    scopes: [healthTest.id, appInsights.id]
    evaluationFrequency: 'PT5M'
    windowSize: 'PT15M'
    criteria: {
      'odata.type': 'Microsoft.Azure.Monitor.WebtestLocationAvailabilityCriteria'
      webTestId: healthTest.id
      componentId: appInsights.id
      failedLocationCount: 2
    }
    actions: [
      { actionGroupId: alertActions.id }
    ]
  }
}

// The one that catches "site up, form broken" — the failure that costs money.
resource contactAlert 'Microsoft.Insights/metricAlerts@2018-03-01' = {
  name: 'alert-${prefix}-contact-availability'
  location: 'global'
  properties: {
    description: 'POST /api/contact stopped returning its validation 400 — the lead path is broken.'
    severity: 1
    enabled: true
    scopes: [contactTest.id, appInsights.id]
    evaluationFrequency: 'PT5M'
    windowSize: 'PT15M'
    criteria: {
      'odata.type': 'Microsoft.Azure.Monitor.WebtestLocationAvailabilityCriteria'
      webTestId: contactTest.id
      componentId: appInsights.id
      failedLocationCount: 1
    }
    actions: [
      { actionGroupId: alertActions.id }
    ]
  }
}

// ── Static Web App settings: deliberately NOT declared here ─────────
//
// Microsoft.Web/staticSites/config REPLACES the entire settings collection on
// every deploy. Declaring the eight non-secret values would DELETE the three
// secrets, and production fails on the next apply: no RESEND_API_KEY means the
// contact form answers 503, no CLASSIFY_QUEUE_SAS_URL means every lead enqueue
// throws. Declaring all eleven with @secure() parameters is worse — any deploy
// that forgot to pass them blanks the secrets silently.
//
// So the settings stay operator-managed, and the contract is made explicit and
// testable instead of tribal:
//   infra/swa-settings.contract.json    — the authoritative list, names only
//   __tests__/infra/swa-settings.test.ts — offline cross-check against the
//                                          code's process.env usage, both ways
//   scripts/check-swa-settings.sh        — live diff (read-only, names only)
//
// The SWA is Standard tier with a system-assigned identity, so Key Vault
// references ARE supported: the literal values are historical, not a platform
// limitation. Migrating them is tracked in docs/strategy/ROADMAP.md and is
// currently blocked on the vault's network ACLs.

// ── Outputs ─────────────────────────────────────────────────────────

output storageAccountName string = storageAccount.name
output appInsightsName string = appInsights.name
output keyVaultName string = keyVault.name
output keyVaultUri string = keyVault.properties.vaultUri
output swaDefaultHostname string = swa.properties.defaultHostname
output actionGroupName string = alertActions.name

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
