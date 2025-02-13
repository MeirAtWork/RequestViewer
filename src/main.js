import './style.css'
import { setupJsonViewer } from './jsonViewer.js'
import { setupStackTraceViewer } from './stackTraceViewer.js'

document.querySelector('#app').innerHTML = `
  <div>
    <h1>Welcome to GlobalE text viewer playground!</h1>

    <div id="jsonViewer"></div>
    <div id="stackTraceViewer"></div>
  </div>
`

setupJsonViewer(document.querySelector('#jsonViewer'), `{  "Hello": "World",  "goTo": "browse to https://www.chatgpt.com and https://gemini.google.com/app",}`)

//use raw string in order to avoid JS removing the '\' characters
let log = String.raw`System.FormatException: Input string was not in a correct format.   at GlobalE.BL.Orders.CreateOrderQueueMessageProxy.CreateOrderBasedOnQueueMessage(AppSettingsBLProxy settings, IMerchantsBL merchants, CreateOrderQueueMessage message, IGELogger logger) in D:\jenkins\workspace\CORE_DanielTest\a4b75ddb5bc00e6051022ca6cbaf5173\BL\Orders\CreateOrderQueueMessageProxy.cs:line 54
at GlobalE.QueueSubscribeService.Consumers.CreateOrderQueueMessageConsumer.Consume(CreateOrderQueueMessage message) in D:\jenkins\workspace\CORE_DanielTest\a4b75ddb5bc00e6051022ca6cbaf5173\GlobalE.QueueSubscribeService\Consumers\CreateOrderQueueMessageConsumer.cs:line 118`;

setupStackTraceViewer(document.querySelector('#stackTraceViewer'), log);
