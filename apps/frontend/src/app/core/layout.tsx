import type { Metadata } from 'next';
import CoreLayoutWrapper from './CoreLayoutWrapper';

export const metadata: Metadata = {
  title: 'Event Registration Core',
  description: 'Event Registration and Management System',
  icons: {
    icon: '/brand-logo.png',
  },
};

export default function CoreLayout({ children }: { children: React.ReactNode }) {
  return <CoreLayoutWrapper>{children}</CoreLayoutWrapper>;
}
