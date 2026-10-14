
export const validateRequired = (value, fieldLabel) => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
        return `${fieldLabel} is required`;
    }
    return null;
};

export const validateNumber = (value, fieldLabel, { min, max } = {}) => {
    const num = Number(value);
    if (value === '' || value === null || isNaN(num)) {
        return `${fieldLabel} must be a valid number`;
    }
    if (min !== undefined && num < min) {
        return `${fieldLabel} cannot be less than ${min}`;
    }
    if (max !== undefined && num > max) {
        return `${fieldLabel} cannot be greater than ${max}`;
    }
    return null;
};

export const validateDate = (value, fieldLabel) => {
    if (!value) return `${fieldLabel} is required`;
    const date = new Date(value);
    if (isNaN(date.getTime())) {
        return `${fieldLabel} must be a valid date`;
    }
    return null;
};
