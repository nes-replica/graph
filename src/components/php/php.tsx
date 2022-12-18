// @ts-ignore
import { PhpWeb as PHP } from 'php-wasm/PhpWeb';
import {useEffect, useState} from "react";


export function PhpComponent()  {
  const [code, setCode] = useState("<?php $name = \"Rob\";\necho \"Hello, $name!\";");
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const php = new PHP;
    php.addEventListener('output', (event: any) => {
      console.log(event);
      setResult(event.detail);
    });
    php.addEventListener('ready', () => {
      php.run(code).then((retVal: any) => {
        console.log(retVal);
      });
    });
  }, [code, setResult])

  return <>
    <textarea value={code} onChange={ev => setCode(ev.target.value)}/>
    <pre>
      {result}
    </pre>
  </>;
}

