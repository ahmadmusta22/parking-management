import * as yup from 'yup';

// Login form validation schema
export const loginSchema = yup.object({
  username: yup
    .string()
    .required('Username is required'),
  password: yup
    .string()
    .required('Password is required')
});

// Registration form validation schema
export const registrationSchema = yup.object({
  username: yup
    .string()
    .required('Username is required'),
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address'),
  password: yup
    .string()
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
  fullName: yup
    .string()
    .required('Full name is required'),
  role: yup
    .string()
    .required('Role is required')
});

// Contact form validation schema
export const contactSchema = yup.object({
  name: yup
    .string()
    .required('Name is required'),
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address'),
  number: yup
    .string()
    .required('Phone number is required'),
  subject: yup
    .string()
    .required('Please select a subject')
    .notOneOf(['Choose'], 'Please select a valid subject'),
  message: yup
    .string()
    .required('Message is required')
});

// Newsletter form validation schema
export const newsletterSchema = yup.object({
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address')
});

// Appointment form validation schema
export const appointmentSchema = yup.object({
  name: yup
    .string()
    .required('Name is required'),
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address'),
  number: yup
    .string()
    .required('Phone number is required'),
  subject: yup
    .string()
    .required('Please select a service')
    .notOneOf(['Choose'], 'Please select a valid service'),
  message: yup
    .string()
    .required('Message is required')
});

// Admin form validation schemas
export const createUserSchema = yup.object({
  username: yup
    .string()
    .required('Username is required'),
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address'),
  fullName: yup
    .string()
    .required('Full name is required'),
  role: yup
    .string()
    .required('Role is required')
});

export const createSubscriptionSchema = yup.object({
  userId: yup
    .string()
    .required('User is required'),
  startDate: yup
    .date()
    .required('Start date is required')
    .min(new Date(), 'Start date cannot be in the past'),
  endDate: yup
    .date()
    .required('End date is required')
    .min(yup.ref('startDate'), 'End date must be after start date'),
  type: yup
    .string()
    .required('Subscription type is required')
    .oneOf(['monthly', 'yearly'], 'Please select a valid subscription type')
});

export const createRushHourSchema = yup.object({
  startTime: yup
    .string()
    .required('Start time is required'),
  endTime: yup
    .string()
    .required('End time is required'),
  multiplier: yup
    .number()
    .required('Multiplier is required')
});

export const createVacationSchema = yup.object({
  startDate: yup
    .date()
    .required('Start date is required'),
  endDate: yup
    .date()
    .required('End date is required'),
  description: yup
    .string()
    .required('Description is required')
});
