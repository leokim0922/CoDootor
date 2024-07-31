import { Center, Paper, Rating, Text, Stack, Tabs, rem, Grid } from '@mantine/core';
import { IconStar, IconCheck, IconX, IconStarFilled } from '@tabler/icons-react';

// Test cases section for UI, this should retrieve prestored testcases for each question
const TestCases = ({ testResults, setTestResults }) => {
  const iconStyle = { width: rem(12), height: rem(12) };

  const totalTests = (testResults) ? testResults.length : 1;
  const passedTests = (testResults) ? testResults.filter(test => test.passed).length : 0;
  const filledStars = Math.floor(passedTests / totalTests * 3);

  return (
    <Stack
      h={300}
      bg="var(--mantine-color-body)"
      align="stretch"
      justify="top"
      gap="md"
    >
      <Tabs defaultValue={testResults[0] ? testResults[0].desc : 'test1'}>
        <Tabs.List>
          {testResults.map((result, index) => (
            <Tabs.Tab 
              key={index}
              value={`test${index + 1}`}
              leftSection={result.passed ? <IconCheck style={iconStyle} /> : <IconX style={iconStyle} />}>
              Test {index + 1}
            </Tabs.Tab>
          ))}
        </Tabs.List>

        {testResults.map((result, index) => (
          <Tabs.Panel key={index} value={`test${index + 1}`}>
            <Text>{result.err ? `Error: ${result.err_reason}` : result.desc}{"\n"}</Text>
            <Text>Test Inputs: [{result.input_args.map((test => `(${test.join()})`)).join(", ")}]</Text>
            <Text>Expected Outputs: [{result.expected_outputs.join(", ")}]</Text>
            <Text>Actual Outputs: [{result.actual_outputs.join(", ")}]</Text>
          </Tabs.Panel>
        ))}
      </Tabs>
      <Paper shadow="xs" withBorder p="xl">
        <Stack
          bg="var(--mantine-color-body)"
          align="stretch"
          justify="center"
          gap="md"
        >
          <Center><Text>{`${passedTests}/${totalTests} tests passed`}</Text></Center>
          <Center>
            <Rating emptySymbol={<IconStar/>} fullSymbol={<IconStarFilled/>} count={3} value={filledStars} onChange={setTestResults} readOnly/>
          </Center>
        </Stack>
      </Paper>
    </Stack>
  );
};

export default TestCases;
