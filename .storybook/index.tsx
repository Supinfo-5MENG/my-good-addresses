import { getStorybookUI } from '@storybook/react-native';
import './storybook.requires';

const StorybookUIRoot = getStorybookUI({
  enableWebsockets: true,
  onDeviceUI: true,
  shouldPersistSelection: true,
  showSearchBox: true,
});

export default StorybookUIRoot;
