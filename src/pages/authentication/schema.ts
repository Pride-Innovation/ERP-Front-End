import * as yup from 'yup';

export const authentiactionSchema = yup.object().shape({
    email: yup.string().required('Email Address is required').email("Invalid Email Address"),
    password: yup.string().required('Password is required'),
});
