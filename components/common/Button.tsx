import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { COLORS, SIZES } from '../../constants';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'danger' | 'outline';
    size?: 'small' | 'medium' | 'large';
    loading?: boolean;
    disabled?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
                                                  title,
                                                  onPress,
                                                  variant = 'primary',
                                                  size = 'medium',
                                                  loading = false,
                                                  disabled = false,
                                                  style,
                                                  textStyle,
                                              }) => {
    const getButtonStyle = (): ViewStyle => {
        const baseStyle: ViewStyle = {
            ...styles.button,
            ...styles[`button_${size}`],
        };

        if (disabled || loading) {
            return {...baseStyle, ...styles.buttonDisabled};
        }

        return {...baseStyle, ...styles[`button_${variant}`]};
    };

    const getTextStyle = (): TextStyle => {
        return {
            ...styles.text,
            ...styles[`text_${size}`],
            ...styles[`text_${variant}`],
        };
    };

    return (
        <TouchableOpacity
            style={[getButtonStyle(), style]}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.7}
        >
            {loading ? (
                <ActivityIndicator
                    color={variant === 'outline' ? COLORS.primary : COLORS.background}
                />
            ) : (
                <Text style={[getTextStyle(), textStyle]}>{title}</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        borderRadius: SIZES.radiusMd,
        alignItems: 'center',
        justifyContent: 'center',
    },

    button_small: {
        paddingHorizontal: SIZES.md,
        paddingVertical: SIZES.sm,
    },
    button_medium: {
        paddingHorizontal: SIZES.lg,
        paddingVertical: SIZES.md,
    },
    button_large: {
        paddingHorizontal: SIZES.xl,
        paddingVertical: SIZES.lg,
    },

    button_primary: {
        backgroundColor: COLORS.primary,
    },
    button_secondary: {
        backgroundColor: COLORS.secondary,
    },
    button_danger: {
        backgroundColor: COLORS.danger,
    },
    button_outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: COLORS.primary,
    },

    buttonDisabled: {
        backgroundColor: COLORS.textTertiary,
        borderColor: COLORS.textTertiary,
    },

    text: {
        fontWeight: '600',
    },
    text_small: {
        fontSize: SIZES.fontSm,
    },
    text_medium: {
        fontSize: SIZES.fontMd,
    },
    text_large: {
        fontSize: SIZES.fontLg,
    },
    text_primary: {
        color: COLORS.background,
    },
    text_secondary: {
        color: COLORS.background,
    },
    text_danger: {
        color: COLORS.background,
    },
    text_outline: {
        color: COLORS.primary,
    },
});