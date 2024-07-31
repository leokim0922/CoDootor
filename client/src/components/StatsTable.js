'use client'

import { Table, NumberFormatter } from '@mantine/core';

export default function StatsTable({ stats, userData }) {
    const rows = stats.map((question, index) => {
      return (
        <Table.Tr key={question.stage}>
          <Table.Td>{`${question.stage}. ${question.name}`}</Table.Td>
          <Table.Td style={{textAlign: 'right'}}>{userData.questions_solved[index + 1]}</Table.Td>
          <Table.Td style={{textAlign: 'right'}}> <NumberFormatter value={stats[index].average_score} decimalScale={2} /> </Table.Td>
          <Table.Td style={{textAlign: 'right'}}> <NumberFormatter value={stats[index].num_solved} /> </Table.Td>
          <Table.Td style={{textAlign: 'right'}}> <NumberFormatter value={stats[index].num_attempted} /> </Table.Td>
          <Table.Td style={{textAlign: 'right'}}> 
            <NumberFormatter value={stats[index].num_attempted == 0 ? 
              0 : stats[index].num_solved / stats[index].num_attempted * 100} decimalScale={0} suffix="%" /> 
          </Table.Td>
        </Table.Tr>
      );
    });
  
    return (
        <Table highlightOnHover style={{width: '75%'}}>
            <Table.Thead>
            <Table.Tr>
                <Table.Th style={{width: '60%'}}>Stage</Table.Th>
                <Table.Th style={{textAlign: 'right', width: '20%'}}>Your Score</Table.Th>
                <Table.Th style={{textAlign: 'right', width: '20%'}}>Average Score</Table.Th>
                <Table.Th style={{textAlign: 'right', width: '30%'}}>Num Solved</Table.Th>
                <Table.Th style={{textAlign: 'right', width: '30%'}}>Num Attempted</Table.Th>
                <Table.Th style={{textAlign: 'right', width: '30%'}}>Completion Rate</Table.Th>
            </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
        </Table>
    )
  }