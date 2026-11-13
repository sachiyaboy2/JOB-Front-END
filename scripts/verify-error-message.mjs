import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { apiErrorMessage } from "../src/utils/apiErrorMessage.js";
const cases = [
  [{error:{code:"NOT_FOUND",message:"The page could not be found"}},"The page could not be found"],
  [{message:"Validation failed",error:{message:"detail"}},"Validation failed"],
  [{error:"Origin not allowed"},"Origin not allowed"],
  [{message:{unexpected:true},error:{code:"UNKNOWN"}},"fallback"],
  [{errors:[{msg:"Password requires a letter"}]},"Password requires a letter"],
  ["Unavailable","Unavailable"],
  [null,"fallback"],
];
for (const [data, expected] of cases) {
  const message = apiErrorMessage({response:{data}}, "fallback");
  assert.equal(message,expected);
  assert.equal(typeof message,"string");
  assert.ok(renderToStaticMarkup(createElement("p",null,message)));
}
assert.match(apiErrorMessage({message:"Network Error"}),/Cannot reach/);
assert.match(apiErrorMessage({code:"ECONNABORTED"}),/too long/);
console.log("PASS: nested hosting errors, backend validation, malformed payloads, React rendering, network and timeout errors.");
