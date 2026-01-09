import {defineType, defineField, defineArrayMember} from 'sanity'
import {DocumentIcon} from '@sanity/icons'

export const userGuidance = defineType({
  name: 'userGuidance',
  title: 'User Guidance',
  type: 'document',
  icon: DocumentIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Section Title',
      type: 'string',
      initialValue: 'User Guidance',
      readOnly: true,
    }),
    defineField({
      name: 'description',
      title: 'Main Description',
      type: 'text',
      rows: 2,
      description: 'Description of what this section provides',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'note',
      title: 'Usage Note',
      type: 'text',
      rows: 2,
      description: 'e.g., "Use natural, varied phrasing and only mention roles when necessary"',
    }),
    defineField({
      name: 'predefinedAnswers',
      title: 'Predefined Answers',
      type: 'array',
      description: 'Task-based guidance with conversational answers',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'task',
              title: 'Task',
              type: 'string',
              description: 'e.g., "How to send an SOS alert", "How to check dashboard status"',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'answer',
              title: 'Predefined Answer',
              type: 'text',
              rows: 3,
              description: 'Conversational and concise answer',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'roleInfo',
              title: 'Role Information',
              type: 'text',
              rows: 2,
              description: 'Who can do this and fallback note for others',
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: {
              title: 'task',
              subtitle: 'answer',
            },
          },
        }),
      ],
      validation: (rule) => rule.required().min(1),
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
      isActive: 'isActive',
    },
    prepare({title, isActive}) {
      return {
        title,
        subtitle: isActive ? 'Active' : 'Inactive',
      }
    },
  },
})
