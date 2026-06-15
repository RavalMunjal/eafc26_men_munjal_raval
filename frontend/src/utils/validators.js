import * as Yup from 'yup'

export const loginSchema = Yup.object({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(6, 'Minimum 6 characters').required('Password is required'),
})

export const registerSchema = Yup.object({
  name: Yup.string().min(2, 'Minimum 2 characters').required('Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(6, 'Minimum 6 characters').required('Password is required'),
  secretKey: Yup.string(), // optional — for admin registration
})

export const conflictSchema = Yup.object({
  Conflict_Name: Yup.string().required('Conflict name is required'),
  Conflict_Type: Yup.string().required('Conflict type is required'),
  Region: Yup.string().required('Region is required'),
  Primary_Country: Yup.string().required('Country is required'),
  Status: Yup.string().required('Status is required'),
  Start_Year: Yup.number()
    .min(1900, 'Year must be ≥ 1900')
    .max(2026, 'Year must be ≤ 2026')
    .required('Start year is required'),
  End_Year: Yup.number()
    .nullable()
    .transform((v, o) => (o === '' ? null : v))
    .min(Yup.ref('Start_Year'), 'End year must be after start year'),
  Inflation_Rate_Percentage: Yup.number().min(-999).max(9999).nullable(),
  GDP_Change_Percentage: Yup.number().nullable(),
  During_War_Poverty_Rate_Percentage: Yup.number().min(0).max(100).nullable(),
  Extreme_Poverty_Rate_Percentage: Yup.number().min(0).max(100).nullable(),
  Food_Insecurity_Rate_Percentage: Yup.number().min(0).max(100).nullable(),
  Pre_War_Unemployment_Percentage: Yup.number().min(0).max(100).nullable(),
  During_War_Unemployment_Percentage: Yup.number().min(0).max(100).nullable(),
  Black_Market_Activity_Level: Yup.string().nullable(),
  War_Profiteering_Documented: Yup.string().nullable(),
  Currency_Devaluation_Percentage: Yup.number().nullable(),
  Currency_Black_Market_Rate_Gap_Percentage: Yup.number().nullable(),
  Estimated_Reconstruction_Cost_USD: Yup.number().nullable(),
  Cost_of_War_USD: Yup.number().nullable(),
  Households_Fallen_Into_Poverty_Estimate: Yup.number().nullable(),
})
