import React from 'react';
import { Card, Image, Text, Badge, Button, Group } from '@mantine/core';
import Link from 'next/link';
import styles from '@/styles/Form.module.scss';
const images = [
  '/image1.png',
  '/image2.png',
  '/image3.png',
  '/image4.png',
  '/image5.png',
  '/image6.png',
  '/image7.png',
  '/image8.png',
  '/image9.png',
  '/image10.png',
];

export default function MyCard(props: {
  title: string;
  description: string;
  link?: string;
  phone?: string;
  email?: string;
  badge?: string;
  way?: string;
}) {
  const { title, description, link, phone, email, badge, way } = props;
  const randomImage = images[Math.floor(Math.random() * images.length)];
  return (
    <Card shadow='sm' p='lg' radius='md' withBorder>
      <Card.Section>
        <Image src='/card.png' height={160} alt='Card' />
      </Card.Section>
      <Group position='apart' mt='md' mb='xs'>
        <Text fz='xl' weight={600}>
          {title}
        </Text>
        {badge != undefined ? (
          <Badge color='pink' variant='light'>
            {badge}
          </Badge>
        ) : null}
      </Group>
      <Text size='md' color='dimmed' sx={{ overflowWrap: 'break-word' }}>
        {description}
      </Text>
      <div className={styles.contacts}>
        <Text
          className={styles.contacts__title}
          size='lg'
          color='dimmed'
          sx={{ overflowWrap: 'break-word' }}
        >
          Contacts:
        </Text>
        {link ? (
          <Link target='_blank' className={styles.link} href={link.toString()}>
            Link: {link.toString()}
          </Link>
        ) : null}
        <Text size='sm' color='dimmed'>
          Phone: {phone}
        </Text>
        <Text size='sm' color='dimmed'>
          Email: {email}
        </Text>
      </div>

      {way != undefined ? (
        <Link href={way}>
          <Button variant='light' color='blue' fullWidth mt='md' radius='md'>
            View
          </Button>
        </Link>
      ) : null}
    </Card>
  );
}
