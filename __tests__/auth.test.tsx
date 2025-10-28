import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import LoginScreen from '../app/(auth)/login';
import RegisterScreen from '../app/(auth)/register';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'expo-router';

jest.mock('../contexts/AuthContext');
jest.mock('expo-router');
jest.spyOn(Alert, 'alert');

describe('Authentication Tests', () => {
    const mockSignIn = jest.fn();
    const mockSignUp = jest.fn();
    const mockRouter = { replace: jest.fn(), push: jest.fn() };

    beforeEach(() => {
        jest.clearAllMocks();
        (useAuth as jest.Mock).mockReturnValue({
            signIn: mockSignIn,
            signUp: mockSignUp,
            user: null,
        });
        (useRouter as jest.Mock).mockReturnValue(mockRouter);
    });

    describe('LoginScreen', () => {
        it('should render login form correctly', () => {
            const { getByPlaceholderText, getByText } = render(<LoginScreen />);

            expect(getByText('Connexion')).toBeTruthy();
            expect(getByPlaceholderText('Email')).toBeTruthy();
            expect(getByPlaceholderText('Mot de passe')).toBeTruthy();
            expect(getByText('Se connecter')).toBeTruthy();
            expect(getByText('Créer un compte')).toBeTruthy();
        });

        it('should show error when fields are empty', async () => {
            const { getByText, findByText } = render(<LoginScreen />);

            const loginButton = getByText('Se connecter');
            fireEvent.press(loginButton);

            const errorMessage = await findByText('Merci de remplir tous les champs.');
            expect(errorMessage).toBeTruthy();
        });

        it('should call signIn with correct credentials', async () => {
            mockSignIn.mockResolvedValueOnce(undefined);

            const { getByPlaceholderText, getByText } = render(<LoginScreen />);

            const emailInput = getByPlaceholderText('Email');
            const passwordInput = getByPlaceholderText('Mot de passe');
            const loginButton = getByText('Se connecter');

            fireEvent.changeText(emailInput, 'test@example.com');
            fireEvent.changeText(passwordInput, 'password123');
            fireEvent.press(loginButton);

            await waitFor(() => {
                expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
                expect(mockRouter.replace).toHaveBeenCalledWith('/');
            });
        });

        it('should handle login errors correctly', async () => {
            mockSignIn.mockRejectedValueOnce({ code: 'auth/user-not-found' });

            const { getByPlaceholderText, getByText, findByText } = render(<LoginScreen />);

            const emailInput = getByPlaceholderText('Email');
            const passwordInput = getByPlaceholderText('Mot de passe');
            const loginButton = getByText('Se connecter');

            fireEvent.changeText(emailInput, 'wrong@example.com');
            fireEvent.changeText(passwordInput, 'wrongpassword');
            fireEvent.press(loginButton);

            const errorMessage = await findByText('Aucun compte trouvé avec cet email.');
            expect(errorMessage).toBeTruthy();
        });

        it('should navigate to register screen', () => {
            const { getByText } = render(<LoginScreen />);

            const registerLink = getByText('Créer un compte');
            fireEvent.press(registerLink);

            expect(mockRouter.push).toHaveBeenCalledWith('/(auth)/register');
        });
    });

    describe('RegisterScreen', () => {
        it('should render register form correctly', () => {
            const { getByPlaceholderText, getByText } = render(<RegisterScreen />);

            expect(getByText('Créer un compte')).toBeTruthy();
            expect(getByPlaceholderText("Nom d'utilisateur")).toBeTruthy();
            expect(getByPlaceholderText('Email')).toBeTruthy();
            expect(getByPlaceholderText('Mot de passe')).toBeTruthy();
            expect(getByPlaceholderText('Confirmer le mot de passe')).toBeTruthy();
            expect(getByText("S'inscrire")).toBeTruthy();
        });

        it('should show error when passwords dont match', async () => {
            const { getByPlaceholderText, getByText, findByText } = render(<RegisterScreen />);

            const emailInput = getByPlaceholderText('Email');
            const passwordInput = getByPlaceholderText('Mot de passe');
            const confirmPasswordInput = getByPlaceholderText('Confirmer le mot de passe');
            const registerButton = getByText("S'inscrire");

            fireEvent.changeText(emailInput, 'test@example.com');
            fireEvent.changeText(passwordInput, 'password123');
            fireEvent.changeText(confirmPasswordInput, 'password456');
            fireEvent.press(registerButton);

            const errorMessage = await findByText('Les mots de passe ne correspondent pas.');
            expect(errorMessage).toBeTruthy();
        });

        it('should call signUp with correct data', async () => {
            mockSignUp.mockResolvedValueOnce(undefined);

            const { getByPlaceholderText, getByText } = render(<RegisterScreen />);

            const displayNameInput = getByPlaceholderText("Nom d'utilisateur");
            const emailInput = getByPlaceholderText('Email');
            const passwordInput = getByPlaceholderText('Mot de passe');
            const confirmPasswordInput = getByPlaceholderText('Confirmer le mot de passe');
            const registerButton = getByText("S'inscrire");

            fireEvent.changeText(displayNameInput, 'John Doe');
            fireEvent.changeText(emailInput, 'john@example.com');
            fireEvent.changeText(passwordInput, 'securepass123');
            fireEvent.changeText(confirmPasswordInput, 'securepass123');
            fireEvent.press(registerButton);

            await waitFor(() => {
                expect(mockSignUp).toHaveBeenCalledWith(
                    'john@example.com',
                    'securepass123',
                    'John Doe'
                );
                expect(mockRouter.replace).toHaveBeenCalledWith('/(tabs)');
            });
        });

        it('should handle registration errors', async () => {
            mockSignUp.mockRejectedValueOnce({ code: 'auth/email-already-in-use' });

            const { getByPlaceholderText, getByText, findByText } = render(<RegisterScreen />);

            const emailInput = getByPlaceholderText('Email');
            const passwordInput = getByPlaceholderText('Mot de passe');
            const confirmPasswordInput = getByPlaceholderText('Confirmer le mot de passe');
            const registerButton = getByText("S'inscrire");

            fireEvent.changeText(emailInput, 'existing@example.com');
            fireEvent.changeText(passwordInput, 'password123');
            fireEvent.changeText(confirmPasswordInput, 'password123');
            fireEvent.press(registerButton);

            const errorMessage = await findByText('Cette adresse est déjà utilisée.');
            expect(errorMessage).toBeTruthy();
        });
    });
});