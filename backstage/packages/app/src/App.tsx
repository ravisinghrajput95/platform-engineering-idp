import { createApp } from '@backstage/frontend-defaults';
import catalogPlugin from '@backstage/plugin-catalog/alpha';
import { githubAuthApiRef } from '@backstage/core-plugin-api';
import { SignInPageBlueprint } from '@backstage/plugin-app-react'; // Fix import
import { SignInPage } from '@backstage/core-components'; // Needed for rendering the UI
import { createFrontendModule } from '@backstage/frontend-plugin-api'; // Needed to wrap the blueprint
import { navModule } from './modules/nav';

// 1. Define the extension using the Blueprint
const signInPageExtension = SignInPageBlueprint.make({
  params: {
    loader: async () => props => (
      <SignInPage
        {...props}
        provider={{
          id: 'github-auth-provider',
          title: 'GitHub',
          message: 'Sign in using your GitHub account',
          apiRef: githubAuthApiRef,
        }}
      />
    ),
  },
});

// 2. Export the Application configuration
export default createApp({
  features: [
    catalogPlugin,
    navModule,
    // 3. Register the extension inside a frontend module
    createFrontendModule({
      pluginId: 'app',
      extensions: [signInPageExtension],
    }),
  ],
});

