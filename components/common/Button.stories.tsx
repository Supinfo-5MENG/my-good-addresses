import { View } from 'react-native';
import { Button } from './Button';
import {Meta, StoryFn} from "@storybook/react-native";

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  decorators: [
    (Story) => (
      <View style={{ padding: 20, flex: 1, justifyContent: 'center' }}>
        <Story />
      </View>
    ),
  ],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'danger', 'outline'],
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
    },
    loading: {
      control: { type: 'boolean' },
    },
    disabled: {
      control: { type: 'boolean' },
    },
  },
};

export default meta;

export const Primary: StoryFn<typeof Button> = (args) => (
  <Button {...args} />
);
Primary.args = {
  title: 'Primary Button',
  onPress: () => console.log('Button pressed'),
  variant: 'primary',
  size: 'medium',
};

export const Secondary: StoryFn<typeof Button> = (args) => (
  <Button {...args} />
);
Secondary.args = {
  title: 'Secondary Button',
  onPress: () => console.log('Button pressed'),
  variant: 'secondary',
  size: 'medium',
};

export const Danger: StoryFn<typeof Button> = (args) => (
  <Button {...args} />
);
Danger.args = {
  title: 'Danger Button',
  onPress: () => console.log('Button pressed'),
  variant: 'danger',
  size: 'medium',
};

export const Outline: StoryFn<typeof Button> = (args) => (
  <Button {...args} />
);
Outline.args = {
  title: 'Outline Button',
  onPress: () => console.log('Button pressed'),
  variant: 'outline',
  size: 'medium',
};

export const Small: StoryFn<typeof Button> = (args) => (
  <Button {...args} />
);
Small.args = {
  title: 'Small Button',
  onPress: () => console.log('Button pressed'),
  variant: 'primary',
  size: 'small',
};

export const Large: StoryFn<typeof Button> = (args) => (
  <Button {...args} />
);
Large.args = {
  title: 'Large Button',
  onPress: () => console.log('Button pressed'),
  variant: 'primary',
  size: 'large',
};

export const Loading: StoryFn<typeof Button> = (args) => (
  <Button {...args} />
);
Loading.args = {
  title: 'Loading Button',
  onPress: () => console.log('Button pressed'),
  variant: 'primary',
  size: 'medium',
  loading: true,
};

export const Disabled: StoryFn<typeof Button> = (args) => (
  <Button {...args} />
);
Disabled.args = {
  title: 'Disabled Button',
  onPress: () => console.log('Button pressed'),
  variant: 'primary',
  size: 'medium',
  disabled: true,
};

export const AllVariants: StoryFn<typeof Button> = () => (
  <View style={{ gap: 10 }}>
    <Button
      title="Primary Button"
      onPress={() => console.log('Primary pressed')}
      variant="primary"
    />
    <Button
      title="Secondary Button"
      onPress={() => console.log('Secondary pressed')}
      variant="secondary"
    />
    <Button
      title="Danger Button"
      onPress={() => console.log('Danger pressed')}
      variant="danger"
    />
    <Button
      title="Outline Button"
      onPress={() => console.log('Outline pressed')}
      variant="outline"
    />
  </View>
);
