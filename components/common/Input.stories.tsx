import { View } from 'react-native';
import { Meta, StoryFn } from '@storybook/react-native';
import { Input } from './Input';
import {useState} from "react";

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  decorators: [
    (Story) => (
      <View style={{ padding: 20, flex: 1, justifyContent: 'center' }}>
        <Story />
      </View>
    ),
  ],
  argTypes: {
    label: {
      control: { type: 'text' },
    },
    error: {
      control: { type: 'text' },
    },
    isPassword: {
      control: { type: 'boolean' },
    },
    placeholder: {
      control: { type: 'text' },
    },
  },
};

export default meta;

export const Default: StoryFn<typeof Input> = (args) => {
  const [value, setValue] = useState('');
  
  return (
    <Input
      {...args}
      value={value}
      onChangeText={setValue}
    />
  );
};
Default.args = {
  placeholder: 'Enter text here',
};

export const WithLabel: StoryFn<typeof Input> = (args) => {
  const [value, setValue] = useState('');
  
  return (
    <Input
      {...args}
      value={value}
      onChangeText={setValue}
    />
  );
};
WithLabel.args = {
  label: 'Email Address',
  placeholder: 'john@example.com',
};

export const WithError: StoryFn<typeof Input> = (args) => {
  const [value, setValue] = useState('');
  
  return (
    <Input
      {...args}
      value={value}
      onChangeText={setValue}
    />
  );
};
WithError.args = {
  label: 'Email Address',
  placeholder: 'john@example.com',
  error: 'Please enter a valid email address',
};

export const Password: StoryFn<typeof Input> = (args) => {
  const [value, setValue] = useState('');
  
  return (
    <Input
      {...args}
      value={value}
      onChangeText={setValue}
    />
  );
};
Password.args = {
  label: 'Password',
  placeholder: 'Enter your password',
  isPassword: true,
};

export const PasswordWithError: StoryFn<typeof Input> = (args) => {
  const [value, setValue] = useState('');
  
  return (
    <Input
      {...args}
      value={value}
      onChangeText={setValue}
    />
  );
};
PasswordWithError.args = {
  label: 'Password',
  placeholder: 'Enter your password',
  isPassword: true,
  error: 'Password must be at least 6 characters',
};

export const FormExample: StoryFn<typeof Input> = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  return (
    <View style={{ gap: 16 }}>
      <Input
        label="Email"
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Input
        label="Password"
        placeholder="Enter your password"
        value={password}
        onChangeText={setPassword}
        isPassword
      />
      <Input
        label="Confirm Password"
        placeholder="Confirm your password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        isPassword
        error={
          confirmPassword && password !== confirmPassword
            ? 'Passwords do not match'
            : undefined
        }
      />
    </View>
  );
};

export const AllStates: StoryFn<typeof Input> = () => {
  const [value1, setValue1] = useState('');
  const [value2, setValue2] = useState('john@example.com');
  const [value3, setValue3] = useState('');
  const [value4, setValue4] = useState('');
  
  return (
    <View style={{ gap: 16 }}>
      <Input
        label="Default Input"
        placeholder="Enter text"
        value={value1}
        onChangeText={setValue1}
      />
      <Input
        label="Filled Input"
        placeholder="Enter text"
        value={value2}
        onChangeText={setValue2}
      />
      <Input
        label="Input with Error"
        placeholder="Enter text"
        value={value3}
        onChangeText={setValue3}
        error="This field is required"
      />
      <Input
        label="Disabled Input"
        placeholder="Enter text"
        value={value4}
        onChangeText={setValue4}
        editable={false}
      />
    </View>
  );
};
