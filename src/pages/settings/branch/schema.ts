import * as yup from 'yup';

export const branchSchema = yup.object().shape({
    name: yup.string().required('Name is required'),
    email: yup.string().trim().email('Invalid email format').required('Email Address is required'),
    tel: yup.string().nullable().optional(),
    desc: yup.string().nullable().optional(),
    status: yup.string().nullable().optional(),
    image: yup.mixed().nullable().optional(),
});