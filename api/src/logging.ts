export default function abbreviatedLog(label: string, content: any, maxLines: number = 20) {
    process.stdout.write(`${label}: `);

    // Convert the content to a formatted string
    const json = JSON.stringify(content, null, 2); // 2-space indentation for readability
    const lines = json.split('\n');

    // If maxLines is Infinity or greater than total lines, print all
    if (maxLines === Infinity || lines.length <= maxLines) {
        process.stdout.write(json + '\n');
        return;
    }

    // Otherwise, print only the allowed number of lines
    const truncated = lines.slice(0, maxLines);
    truncated.push(`... (${lines.length - maxLines} more lines omitted)`);
    process.stdout.write(truncated.join('\n') + '\n');
}