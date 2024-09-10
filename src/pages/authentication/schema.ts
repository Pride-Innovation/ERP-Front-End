import * as yup from 'yup';

export const loginSchema = yup.object().shape({
    email: yup.string().required('Email Address is required').email("Invalid Email Address"),
    password: yup.string().required('Password is required'),
});

export const forgotPasswordSchema = yup.object().shape({
    email: yup.string().required('Email Address is required').email("Invalid Email Address")
})