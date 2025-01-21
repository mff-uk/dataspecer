import { usePackage, PackageContextProvider } from "./dataspecer/package/package-react-binding";
import { UiModelProvider } from "./dataspecer/ui-model/ui-model-react-binding";

export function ConceptualModelEditor() {
  const { packageContext, packageContextApi } = usePackage();
  if (packageContext === null) {
    return <LoadingScreen />;
  }
  return (
    <PackageContextProvider context={packageContext} api={packageContextApi} >
      <UiModelProvider
        semanticModels={packageContext.semanticModels}
        visualModel={packageContext.activeVisualModel}
        aggregatorView={packageContext.semanticAggregatorView}
      >
        Content ...
      </UiModelProvider>
    </PackageContextProvider>
  );
}

function LoadingScreen() {
  return null;
}