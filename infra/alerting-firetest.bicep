// Live-fire test for the alerting path. THROWAWAY — deploy, confirm, delete.
//
// An alert that has never fired is theater. This deploys a webtest against a
// path that certainly 404s, so it fails on every run and drives a paired alert
// through the real action group. It proves the whole chain end to end:
// webtest -> App Insights -> metric alert -> action group.
//
// It is deliberately a SEPARATE template and is never referenced by
// main.bicep, so a normal deployment can never create it.
// __tests__/infra/alerting.test.ts asserts that separation.
//
// Run it:
//   az deployment group create -g BTAI-RG1 \
//     --template-file infra/alerting-firetest.bicep --name btai-firetest
//
// Confirm it fired (expect monitorCondition "Fired" within ~1-2 minutes):
//   SUB=$(az account show --query id -o tsv)
//   az rest --method get --url "https://management.azure.com/subscriptions/$SUB/providers/Microsoft.AlertsManagement/alerts?api-version=2019-05-05-preview&timeRange=1h"
//
// THEN DELETE BOTH, alert first (it references the webtest):
//   az monitor metrics alert delete -n alert-btai-firetest-DELETEME -g BTAI-RG1
//   az resource delete -g BTAI-RG1 -n wt-btai-firetest-DELETEME \
//     --resource-type Microsoft.Insights/webtests
//
// Last run 2026-07-28: fired in ~40s at Sev4. Note that the failing webtest's
// availability metric lingers in App Insights history after deletion; that is
// retained data, not a surviving resource.

param location string = 'eastus2'
param appInsightsName string = 'appi-btai-site-prod'
param actionGroupName string = 'ag-btai-site-prod'

resource appInsights 'Microsoft.Insights/components@2020-02-02' existing = {
  name: appInsightsName
}

resource actionGroup 'Microsoft.Insights/actionGroups@2023-01-01' existing = {
  name: actionGroupName
}

resource fireTest 'Microsoft.Insights/webtests@2022-06-15' = {
  name: 'wt-btai-firetest-DELETEME'
  location: location
  tags: {
    'hidden-link:${appInsights.id}': 'Resource'
  }
  properties: {
    SyntheticMonitorId: 'wt-btai-firetest-DELETEME'
    Name: 'TEMPORARY alerting live-fire test'
    Enabled: true
    Frequency: 300
    Timeout: 30
    Kind: 'standard'
    RetryEnabled: false
    Locations: [
      { Id: 'us-ca-sjc-azr' }
      { Id: 'us-il-ch1-azr' }
      { Id: 'us-va-ash-azr' }
    ]
    Request: {
      // A path that certainly 404s, so the probe fails every run.
      RequestUrl: 'https://bridgingtrust.ai/__alerting-live-fire-does-not-exist'
      HttpVerb: 'GET'
    }
    ValidationRules: {
      ExpectedHttpStatusCode: 200
      SSLCheck: false
    }
  }
}

resource fireAlert 'Microsoft.Insights/metricAlerts@2018-03-01' = {
  name: 'alert-btai-firetest-DELETEME'
  location: 'global'
  properties: {
    description: 'TEMPORARY live-fire test of the BTAI alerting path. Delete after use.'
    severity: 4
    enabled: true
    scopes: [fireTest.id, appInsights.id]
    evaluationFrequency: 'PT1M'
    windowSize: 'PT5M'
    criteria: {
      'odata.type': 'Microsoft.Azure.Monitor.WebtestLocationAvailabilityCriteria'
      webTestId: fireTest.id
      componentId: appInsights.id
      failedLocationCount: 2
    }
    actions: [
      { actionGroupId: actionGroup.id }
    ]
  }
}
