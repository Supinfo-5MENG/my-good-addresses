import React, { useState } from 'react';
import {
    View,
    TextInput,
    Text,
    StyleSheet,
    TextInputProps,
    TouchableOpacity,
} from 'react-native';
import { COLORS, SIZES } from '../../constants';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    containerStyle?: any;
    isPassword?: boolean;
}

export const Input: React.FC<InputProps> = ({
                                                label,
                                                error,
                                                containerStyle,
                                                isPassword = false,
                                                ...textInputProps
                                            }) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    return (
        <View style={[styles.container, containerStyle]}>
            {label && <Text style={styles.label}>{label}</Text>}

            <View style={styles.inputContainer}>
                <TextInput
                    style={[styles.input, error && styles.inputError]}
                    placeholderTextColor={COLORS.textSecondary}
                    secureTextEntry={isPassword && !isPasswordVisible}
                    {...textInputProps}
                />

                {isPassword && (
                    <TouchableOpacity
                        style={styles.eyeButton}
                        onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                    >
                        <Text style={styles.eyeIcon}>
                            {isPasswordVisible ? '👁️' : '👁️‍🗨️'}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            {error && <Text style={styles.error}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: SIZES.md,
    },
    label: {
        fontSize: SIZES.fontMd,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: SIZES.sm,
    },
    inputContainer: {
        position: 'relative',
    },
    input: {
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: SIZES.radiusMd,
        paddingHorizontal: SIZES.md,
        paddingVertical: SIZES.md,
        fontSize: SIZES.fontMd,
        backgroundColor: COLORS.background,
        color: COLORS.text,
    },
    inputError: {
        borderColor: COLORS.danger,
    },
    eyeButton: {
        position: 'absolute',
        right: SIZES.md,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
    },
    eyeIcon: {
        fontSize: 20,
    },
    error: {
        fontSize: SIZES.fontSm,
        color: COLORS.danger,
        marginTop: SIZES.xs,
    },
});