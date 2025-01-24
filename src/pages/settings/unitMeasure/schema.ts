import * as yup from 'yup';

export const unitMeasureSchema = yup.object().shape({
    name: yup.string().required('Name is required'),
    symbol: yup.string().required('Symbol is required'),
    desc: yup.string().nullable().optional(),
    status: yup.string().nullable().optional(),
    image: yup.mixed().nullable().optional(),
});
