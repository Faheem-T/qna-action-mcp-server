# Main Title with **Bold** Text

This is a regular paragraph that is now much longer to ensure we are testing the parser's ability to handle substantial blocks of text. It's important to verify that the parser doesn't choke on larger chunks of content and that it correctly processes everything within expected limits. We want to see if it handles line breaks and other standard markdown features correctly when the text flows over multiple lines.

## Subheading 1: *Italics*

This paragraph contains **bold** text, *italic* text, and a [link to a website](https://example.com) that serves as an example. The complexity of this sentence is slightly increased to ensure that the recursive text extraction logic works perfectly even when there are multiple nested nodes adjacent to each other. For instance, **bold** followed immediately by *italics* or `inline code` shouldn't cause any issues.

### Deep Nested Heading

Here is a code block that demonstrates some typescript code:

```typescript
function hello(name: string) {
  console.log(`Hello, ${name}!`);
  // This is a comment inside the code block
  return true;
}
```

This section is testing deep nesting. We want to make sure the hierarchy stack correctly tracks that we are inside Level 3, which is inside Level 2, which is inside Level 1.

## Subheading 2

Another paragraph that acts as a separator between sections.

- List item 1 (The parser might treat this as a paragraph if structured that way, or ignore it if not handled). We are making this list item longer as well to see if it gets picked up as a paragraph block or if the list handling (which isn't explicitly implemented in the simple parser) behaves in a specific way.
- List item 2 is just a short one.

## A Very Long Section to Test Limits

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris. Integer in mauris eu nibh euismod gravida. Duis ac tellus et risus vulputate vehicula. Donec lobortis risus a elit. Etiam tempor. Ut ullamcorper, ligula eu tempor congue, eros est euismod turpis, id tincidunt sapien risus a quam. Maecenas fermentum consequat mi. Donec fermentum. Pellentesque malesuada nulla a mi. Duis sapien sem, aliquet nec, commodo eget, consequat quis, neque. Aliquam faucibus, elit ut dictum aliquet, felis nisl adipiscing sapien, sed malesuada diam lacus eget erat. Cras mollis scelerisque nunc. Nullam arcu. Aliquam consequat. Curabitur augue lorem, dapibus quis, laoreet et, pretium ac, nisi. Aenean magna nisl, mollis quis, molestie eu, feugiat in, orci. In hac habitasse platea dictumst.

## Table Section

| ID | Name | Role |
| -- | ---- | ---- |
| 1  | John | Dev  |
| 2  | Jane | PM   |
