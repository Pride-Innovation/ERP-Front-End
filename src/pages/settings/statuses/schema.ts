import * as yup from 'yup';

export const statusSchema = yup.object().shape({
    name: yup.string().required('Name is required'),
    desc: yup.string().nullable().optional(),
    status: yup.string().nullable().optional(),
    image: yup.mixed().nullable().optional(),
});
