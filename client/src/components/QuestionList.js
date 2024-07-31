'use client'

import { Table, Rating } from '@mantine/core';
import {
  IconLockFilled,
  IconLockOpen2,
  IconStar,
  IconStarFilled,
} from '@tabler/icons-react';
import QuestionButton from "@/components/QuestionButton";

export default function QuestionList({ questions, userData }) {
    const stages = questions.map((question, index) => {
      const scores = userData.questions_solved;
      const previous_score = (question.stage > 1) ? scores[question.stage - 1] : 1
      const status = (previous_score > 0) ? 'unlocked' : 'locked'
      const score = scores[question.stage] || 0;
      return {
          id: question.stage,
          status: status,
          stage: question.stage,
          name: question.name,
          score: score / question.num_tests
      };
    });

    const rows = stages.map((question) => {
      const filledStars = Math.floor(question.score / 0.33);
  
      return (
        <Table.Tr key={question.stage}>
          <Table.Td>{question.status === 'unlocked' ? <IconLockOpen2 /> : <IconLockFilled />}</Table.Td>
          <Table.Td>{`${question.stage}. ${question.name}`}</Table.Td>
          <Table.Td style={{ textAlign: 'right'}}>{`${Math.round(question.score * 100)}%`}</Table.Td>
          <Table.Td> <Rating emptySymbol={<IconStar/>} fullSymbol={<IconStarFilled/>} count={3} defaultValue={filledStars} readOnly/> </Table.Td>
          <Table.Td>
            <QuestionButton
              url={'/question/' + question.id}
              disabled={question.status === 'locked'} 
              style={question.status === 'locked' ? { backgroundColor: 'gray', cursor: 'not-allowed' } : {}}
            >
              Proceed
            </QuestionButton>
          </Table.Td>
        </Table.Tr>
      );
    });
  
    return (
        <Table striped highlightOnHover>
            <Table.Thead>
            <Table.Tr>
                <Table.Th style={{width: '5%'}}>Status</Table.Th>
                <Table.Th style={{width: '75%'}}>Stage</Table.Th>
                <Table.Th style={{width: '20%', textAlign: 'right'}}>Score</Table.Th>
            </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
        </Table>
    )
  }