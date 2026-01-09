import {defineType, defineField} from 'sanity'
import {EnvelopeIcon} from '@sanity/icons'

export const contactInformation = defineType({
  name: 'contactInformation',
  title: 'Contact Information',
  type: 'document',
  icon: EnvelopeIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Section Title',
      type: 'string',
      initialValue: 'Contact Information',
      readOnly: true,
    }),
    defineField({
      name: 'description',
      title: 'Usage Description',
      type: 'text',
      rows: 2,
      initialValue:
        'When users ask about contacting ResQWave, support, or need help, always provide:',
      description: 'When to provide this information',
    }),
    defineField({
      name: 'email',
      title: 'Contact Email',
      type: 'string',
      validation: (rule) => rule.required().email(),
    }),
    defineField({
      name: 'phone',
      title: 'Contact Phone',
      type: 'string',
    }),
    defineField({
      name: 'supportHours',
      title: 'Support Hours',
      type: 'string',
      description: 'e.g., "24/7" or "9am-5pm Mon-Fri"',
    }),
    defineField({
      name: 'exampleResponses',
      title: 'Example Responses',
      type: 'array',
      description: 'Example ways to present contact information',
      of: [{type: 'string'}],
      initialValue: [
        'For additional support, you can reach us at [email]',
        'Contact our team at [email] for further assistance',
      ],
    }),
    defineField({
      name: 'isActive',
      title: 'Active',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      email: 'email',
      isActive: 'isActive',
    },
    prepare({title, email, isActive}) {
      return {
        title,
        subtitle: isActive ? email : 'Inactive',
      }
    },
  },
})
