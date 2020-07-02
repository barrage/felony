#!/usr/bin/env node

import fs from "fs";

(async () => {
  if (fs.existsSync(`${process.cwd()}/index.js`)) {
      import(`${process.cwd()}/index.js`);
  }
  else {
    const F = await import("./Felony.js");
    await F.app.commit();
  }
})();
