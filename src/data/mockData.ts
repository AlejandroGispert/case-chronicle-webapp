
import { Case } from '../types';

export const mockCases: Case[] = [
  {
    id: '1',
    title: 'Smith vs Johnson',
    number: 'L-2023-001',
    client: 'John Smith',
    status: 'active',
    dateCreated: '2023-12-15',
    emails: [
      {
        id: 'e1',
        from: 'john.smith@email.com',
        to: 'legal@mycases.com',
        subject: 'Initial Consultation Request',
        body: 'I would like to schedule a consultation regarding my potential case against Johnson Industries.',
        date: '2023-12-15',
        time: '09:15 AM',
        hasAttachments: true,
        attachments: [
          {
            id: 'a1',
            filename: 'contract_agreement.pdf',
            type: 'application/pdf',
            url: '/placeholder.svg'
          }
        ]
      },
      {
        id: 'e2',
        from: 'legal@mycases.com',
        to: 'john.smith@email.com',
        subject: 'Re: Initial Consultation Request',
        body: 'Thank you for reaching out. We have reviewed your documents and would like to schedule a meeting.',
        date: '2023-12-16',
        time: '11:30 AM',
        hasAttachments: false
      },
      {
        id: 'e3',
        from: 'john.smith@email.com',
        to: 'legal@mycases.com',
        subject: 'Additional Evidence',
        body: 'Please find attached the photos from the incident that we discussed during our meeting.',
        date: '2023-12-20',
        time: '02:45 PM',
        hasAttachments: true,
        attachments: [
          {
            id: 'a2',
            filename: 'evidence_photo_1.jpg',
            type: 'image/jpeg',
            url: '/placeholder.svg'
          },
          {
            id: 'a3',
            filename: 'evidence_photo_2.jpg',
            type: 'image/jpeg',
            url: '/placeholder.svg'
          }
        ]
      }
    ],
    events: []
  },
  {
    id: '2',
    title: 'Davis Property Dispute',
    number: 'L-2023-002',
    client: 'Emily Davis',
    status: 'active',
    dateCreated: '2024-01-05',
    emails: [
      {
        id: 'e4',
        from: 'emily.davis@email.com',
        to: 'legal@mycases.com',
        subject: 'Property Line Dispute',
        body: 'I need assistance with a property line dispute with my neighbor. They have erected a fence that encroaches on my property.',
        date: '2024-01-05',
        time: '10:00 AM',
        hasAttachments: true,
        attachments: [
          {
            id: 'a4',
            filename: 'property_survey.pdf',
            type: 'application/pdf',
            url: '/placeholder.svg'
          }
        ]
      },
      {
        id: 'e5',
        from: 'legal@mycases.com',
        to: 'emily.davis@email.com',
        subject: 'Re: Property Line Dispute',
        body: 'We have reviewed your survey documents and would like to schedule a site visit to assess the situation.',
        date: '2024-01-07',
        time: '03:20 PM',
        hasAttachments: false
      }
    ],
    events: []
  },
  {
    id: '3',
    title: 'Wilson Intellectual Property',
    number: 'L-2023-003',
    client: 'Robert Wilson',
    status: 'pending',
    dateCreated: '2024-02-10',
    emails: [
      {
        id: 'e6',
        from: 'robert.wilson@email.com',
        to: 'legal@mycases.com',
        subject: 'Patent Infringement Concern',
        body: 'I believe a competitor is using technology that infringes on my patent (#US9876543).',
        date: '2024-02-10',
        time: '08:45 AM',
        hasAttachments: true,
        attachments: [
          {
            id: 'a5',
            filename: 'patent_documentation.pdf',
            type: 'application/pdf',
            url: '/placeholder.svg'
          },
          {
            id: 'a6',
            filename: 'competitor_product.jpg',
            type: 'image/jpeg',
            url: '/placeholder.svg'
          }
        ]
      }
    ],
    events: []
  },
  {
    id: '4',
    title: 'Martinez Workplace Claim',
    number: 'L-2023-004',
    client: 'Sofia Martinez',
    status: 'closed',
    dateCreated: '2023-11-20',
    emails: [
      {
        id: 'e7',
        from: 'sofia.martinez@email.com',
        to: 'legal@mycases.com',
        subject: 'Workplace Discrimination Claim',
        body: 'I would like to file a workplace discrimination claim against my former employer.',
        date: '2023-11-20',
        time: '04:30 PM',
        hasAttachments: true,
        attachments: [
          {
            id: 'a7',
            filename: 'employment_records.pdf',
            type: 'application/pdf',
            url: '/placeholder.svg'
          }
        ]
      },
      {
        id: 'e8',
        from: 'legal@mycases.com',
        to: 'sofia.martinez@email.com',
        subject: 'Case Resolution',
        body: 'We are pleased to inform you that your case has been successfully resolved. The settlement papers are attached.',
        date: '2024-04-15',
        time: '01:15 PM',
        hasAttachments: true,
        attachments: [
          {
            id: 'a8',
            filename: 'settlement_agreement.pdf',
            type: 'application/pdf',
            url: '/placeholder.svg'
          }
        ]
      }
    ],
    events: []
  }
];

export const getCases = () => {
  return mockCases;
};

export const getCaseById = (id: string) => {
  return mockCases.find(c => c.id === id);
};
