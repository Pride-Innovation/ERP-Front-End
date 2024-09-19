import * as yup from 'yup';

export const changePasswordSchema = yup.object().shape({
    oldPassword: yup.string().required('Old Password is required'),
    newPassword: yup.string().required('Please enter your password.'),
    confirmPassword: yup.string().required('Please retype your password.')
        .oneOf([yup.ref('newPassword')], 'Your passwords do not match.')
});