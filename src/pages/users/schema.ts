import * as yup from 'yup';

export const userSchema = yup.object().shape({
    reportsTo: yup.string().required('Reports To is required'),
    firstName: yup.string().required('First Name is required'),
    lastName: yup.string().required('Last Name is required'),
    otherName: yup.string().nullable().optional(),
    email: yup.string().required('Email Address is required').email("Invalid Email Address"),
    title: yup.string().required('Title is required'),
    department: yup.string().required('Department is required'),
    unit: yup.string().required('Unit is required'),
    gender: yup.string().required('Gender is required'),
    staffNumber: yup.string().required('Staff Number is required'),
    availability: yup.boolean().required('Availability is required'),
});
