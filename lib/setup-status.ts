import { setupProviders, type IntegrationProvider } from "@/lib/integrations";

export type SetupProviderStatus = IntegrationProvider & {
  configuredKeys: number;
  isConfigured: boolean;
};

function hasEnvValue(key: string) {
  return Boolean(process.env[key]?.trim());
}

export function getSetupStatus(): SetupProviderStatus[] {
  return setupProviders.map((provider) => {
    const configuredKeys = provider.envKeys.filter(hasEnvValue).length;

    return {
      ...provider,
      configuredKeys,
      isConfigured: configuredKeys === provider.envKeys.length,
    };
  });
}
