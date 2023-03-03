import React from 'react';
import { Card, Image, Text, Badge, Button, Group, Stack } from '@mantine/core';
import Link from 'next/link';

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
  return (
    <Card shadow='sm' p='lg' radius='md' withBorder>
      <Card.Section>
        <Image src='/card.png' height={160} alt='Norway' />
      </Card.Section>
      <Group position='apart' mt='md' mb='xs'>
        <Text fz='lg' weight={600}>
          {title}
        </Text>
        {
          badge != undefined ?
            <Badge color='pink' variant='light'>
              {badge}
            </Badge>
            : null
        }
      </Group>
      <Text size='md' color='dimmed' sx={{ overflowWrap: 'break-word' }}>
        {description}
      </Text>
      <Stack>
        {link ? <Link  href={link.toString()}>
          {link.toString()}
        </Link> : null}

        <Text size='sm' color='dimmed'>
          {phone}
        </Text>
        <Text size='sm' color='dimmed'>
          {email}
        </Text>
      </Stack>

      {
        way != undefined ?
          <Link href={way}>
            <Button variant='light' color='blue' fullWidth mt='md' radius='md'>
              View
            </Button>
          </Link> : null}

    </Card>
  );
}
