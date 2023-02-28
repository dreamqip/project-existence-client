import React from 'react';
import { Card, Image, Text, Badge, Button, Group } from '@mantine/core';
import Link from 'next/link';
import { link } from 'fs';
import path from 'path';

export default function MyCard(props: {
    title: string;
    description: string;
    badge?: string;
    way: string;
}) {
    const { title, description, badge, way } = props;
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
            <Text size='sm' color='dimmed'>
                {description}
            </Text>
            <Link href={way}>
                <Button variant='light' color='blue' fullWidth mt='md' radius='md'>
                    View
                </Button>
            </Link>
        </Card>
    );
}
