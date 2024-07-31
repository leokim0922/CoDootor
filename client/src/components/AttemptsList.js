import React, { useEffect, useState } from 'react';
import { Accordion, Button, Rating, Divider, Title } from '@mantine/core';
import { IconStar, IconStarFilled } from '@tabler/icons-react';
import { useUser } from '@auth0/nextjs-auth0/client';

/* 
    Shows a list of all the past attempts on the current question
    Clicking on the attempt panel will load the attempt data into the form
*/

const AttemptsList = ({ callback, score_callback, attempts }) => {
    const correct = (test) => test.passed
    const perfect = (attempt) => attempt.results.every(correct)
    if (attempts.some(perfect)) score_callback(true);
    
    const items = attempts.map((attempt, index) => {
        const totalScore = attempt.results.reduce((acc, cur) => cur.passed ? acc + cur.pts : acc, 0);
        const maxScore = attempt.results.reduce((acc, cur) => acc + cur.pts, 0);
        const numStars = Math.floor((totalScore / maxScore) / 0.33);
        return (
        <Accordion.Item key={index} value={`Attempt ${index + 1}`}>
            <Accordion.Control icon={<Rating emptySymbol={<IconStar/>} fullSymbol={<IconStarFilled/>} count={3} defaultValue={numStars} readOnly/>}>
                    {`Attempt ${index + 1}`}
                    
            </Accordion.Control>
            <Accordion.Panel>
                <Title order = {4}>{attempt.desc}</Title>
                <div>
                    {attempt.results.map((result, idx) => (
                        <div key={idx}>
                            <span>{`Score: ${result.passed ? result.pts : 0}`}</span>
                        </div>
                    ))}
                </div>
                <Divider my="md" label="User comment" labelPosition="left" />
                <div>{attempt.comment}</div>
                <Divider my="md"/>
                <Button onClick={() => {callback(attempt);}}>Load Attempt</Button>
            </Accordion.Panel>
        </Accordion.Item>
    )});

    return (
        <Accordion variant="contained" chevronPosition="left" miw={500}>
            {items}
        </Accordion>
    );
};

export default AttemptsList;