import React from 'react';
import { Card, Image, Text, Badge, Button, Group } from '@mantine/core';
import Link from 'next/link';

export default function MyCard(props: {
  title: string;
  description: string;
  contacts: string;
  badge?: string;
  way?: string;
}) {
  const { title, description, contacts, badge, way } = props;
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
      <Text size='md' color='dimmed' sx={{overflowWrap: 'break-word'}}>
        {description}
      </Text>
      <Text size='sm' color='dimmed'>
        {contacts}
      </Text>
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
