/** Local runtime: no API base, so the real runtimeApi takes its local-content path. */
export const API_BASE_URL = '';
export const isApiConfigured = () => false;
export const isProductionApiSafe = () => true;
export const productionConfigError = () => null;
