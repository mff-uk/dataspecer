import { OutputStream } from "@dataspecer/core/io/stream/output-stream";
import { XmlStreamWriter } from "../xml-writer.ts";

const testPrefix = "XML writer: ";

function getWriter(): [string[], XmlStreamWriter] {
  const buffer = [];

  return [buffer, new XmlStreamWriter({
    write: async function(text: string) {
      buffer.push(text);
    },
    close: async function() { }
  })];
}

test(testPrefix + "XML declaration", async () => {
  const [buffer, writer] = getWriter();
  await writer.writeXmlDeclaration("1.0", "utf-8");
  expect(buffer.join("")).toBe('<?xml version="1.0" encoding="utf-8"?>\n');
});

test(testPrefix + "comment", async () => {
  const [buffer, writer] = getWriter();
  await writer.writeComment("comment");
  expect(buffer.join("")).toBe('<!--comment-->\n');
});

test(testPrefix + "elements and attributes", async () => {
  const [buffer, writer] = getWriter();
  await writer.registerNamespace("ns", "uri");
  await writer.writeElementBegin("ns", "elem");
  await writer.writeLocalAttributeValue("attr1", "val1");
  await writer.writeAttributeValue("ns", "attr2", "val2");
  await writer.writeElementEnd("ns", "elem");
  expect(buffer.join("")).toBe('<ns:elem attr1="val1" ns:attr2="val2"/>\n');
});

test(testPrefix + "elements and attributes (writeElementFull)", async () => {
  const [buffer, writer] = getWriter();
  await writer.registerNamespace("ns", "ns");
  await writer.writeElementFull("ns", "elem")(async writer => {
    await writer.writeLocalAttributeValue("attr1", "val1");
    await writer.writeAttributeValue("ns", "attr2", "val2");
  });
  expect(buffer.join("")).toBe('<ns:elem attr1="val1" ns:attr2="val2"/>\n');
});

test(testPrefix + "empty element", async () => {
  const [buffer, writer] = getWriter();
  await writer.writeElementEmpty(null, "elem");
  expect(buffer.join("")).toBe('<elem/>\n');
});

test(testPrefix + "null value element", async () => {
  const [buffer, writer] = getWriter();
  await writer.writeElementValue(null, "elem", null);
  expect(buffer.join("")).toBe('');
});

test(testPrefix + "null value attribute", async () => {
  const [buffer, writer] = getWriter();
  await writer.writeElementBegin(null, "elem");
  await writer.writeLocalAttributeValue("attr", null);
  await writer.writeElementEnd(null, "elem");
  expect(buffer.join("")).toBe('<elem/>\n');
});

test(testPrefix + "escaping", async () => {
  const [buffer, writer] = getWriter();
  await writer.writeElementBegin(null, "elem");
  await writer.writeLocalAttributeValue("attr", " <\"'&> ");
  await writer.writeText(" <\"'&> ");
  await writer.writeElementEnd(null, "elem");
  expect(buffer.join("")).toBe('<elem attr=" &#60;&#34;\'&#38;&#62; ">\n   &#60;&#34;\'&#38;&#62; </elem>\n');
});

test(testPrefix + "namespace declaration", async () => {
  const [buffer, writer] = getWriter();
  await writer.writeElementFull(null, "elem")(async writer => {
    await writer.writeAndRegisterNamespaceDeclaration("ns", "uri");
    await writer.writeAttributeValue("ns", "attr", "val");
  });
  expect(buffer.join("")).toBe('<elem xmlns:ns="uri" ns:attr="val"/>\n');
});

test(testPrefix + "indentation", async () => {
  const [buffer, writer] = getWriter();
  await writer.writeElementFull(null, "elem")(async writer => {
    await writer.writeElementValue(null, "elem", "1");
    await writer.writeElementValue(null, "elem", "2");
  });
  expect(buffer.join("")).toBe('<elem>\n  <elem>1</elem>\n  <elem>2</elem>\n</elem>\n');
});
