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

setupJsonViewer(document.querySelector('#jsonViewer'), 300, `{
  "CountryCode":"ID",

  "ClientIP":"109.226.21.168",
  "Currency":{
    "OriginalCurrencyCode":"GBP",
    "CurrencyCode":"IDR"
  },
  "Culture":{
    "PreferedCultureCode":"en-GB",
    "InputDataCultureCode":null,
    "CultureCode":"en-GB"
  },
  "LocalShippingOptions":[
    {
      "Carrier":"globaleintegration",
      "CarrierTitle":"Global-E Carrier",
      "CarrierName":"Global-E Carrier",
      "Code":"globaleintegration_standard",
      "Method":"standard",
      "MethodTitle":"Standard",
      "MethodDescription":"",
      "Price":0.0,
      "IsPreferred":false
    }],
  "Products":[
    {
      "Attributes":[
        {
          "AttributeCode":"color",
          "Name":"Grey",
          "AttributeTypeCode":"color"
        },
        {
          "AttributeCode":"size",
          "Name":"L",
          "AttributeTypeCode":"size"
        }],
      "ListPrice":44275.0,
      "OriginalListPrice":2.5,
      "OriginalSalePrice":2.5,
      "OriginalSalePriceBeforeRounding":2.5,
      "SalePrice":44275.0,
      "SalePriceBeforeRounding":44275.0,
      "OriginalMerchantPriceForDuties":0.0,
      "MerchantPriceForDuties":0.0,
      "ProductCode":"BRC1393.C8",
      "ProductGroupCode":"BRC1393.C8",
      "ProductCodeSecondary":"",
      "ProductGroupCodeSecondary":"",
      "CartItemId":0,
      "ParentCartItemId":null,
      "CartItemOptionId":"",
      "Name":"Harry Potter Bear",
      "Description":"Calling all witches, wizards, and MUGGLES! Now you can embark on magical adventures with your very own HARRY POTTER Bear! This enchanting furry friend has soft brown fur and golden paw pads with the official Harry Potter logo and HOGWARTS crest. Wizarding World fans can have even more fantastic fun by adding officially-licensed clothing and accessories to their bear! This item cannot be purchased unstuffed. A scent or sound cannot be placed inside this furry friend.",
      "Keywords":"",
      "URL":"https://www.buildabear.com/harry-potter-bear/028954.html",
      "GenericHSCode":"620130",
      "OriginCountryCode":"GB",
      "Weight":0.01,
      "Height":0.0,
      "Width":0.0,
      "Length":0.02,
      "Volume":0.0,
      "ImageURL":"https://www.buildabear.com/dw/image/v2/BBNG_PRD/on/demandware.static/-/Sites-buildabear-master/default/dw5a8324b2/54231221228954x20021013.jpg?sw=70&sh=70&sm=fit",
      "ImageHeight":"",
      "ImageWidth":"",
      "IsFixedPrice":false,
      "OrderedQuantity":1,
      "DeliveryQuantity":1,
      "IsBlockedForGlobalE":"",
      "IsVirtual":false,
      "IsGiftCard":false,
      "HubCode":null,
      "IsBundle":"False",
      "VatRateType":{
        "VATRateTypeCode":"Default VAT",
        "Name":"Indonesia (ID) Default VAT",
        "Rate":11.0,
        "InternalVATRateTypeId":0
      },
      "MetaData":null,
      "LocalVatRateType":{
        "VATRateTypeCode":"United Kingdom (GB) Default VAT",
        "Name":"Standard",
        "Rate":21.0,
        "InternalVATRateTypeId":0
      },
      "Brand":null,
      "Categories":[
      ],
      "EstimatedDeliveryDate":null,
      "DiscountValue":null,
      "DeliveryType":null,
      "ShipToStoreCode":null
    }],
  "PriceModification":null,
  "CookieConsent":null,
  "CartToken":"",
  "MerchantCartToken":"4e03bedf-127f-4b1a-8710-8ec0e0219e4e",
  "MerchantCartHash":null,
  "HubId":null,
  "PaymentInstallments":[
  ],
  "UserDetails":{
    "UserId":null,
    "Email":null,
    "Phone":null,
    "AddressDetails":[
    ],
    "IsB2B":false
  },
  "VATRegistration":{
    "DoNotChargeVAT":0,
    "VATRegistrationNumber":null
  },
  "UrlParameters":null,
  "Discounts":[
  ],
  "FreeShipping":null,
  "AllowMailsFromMerchant":false,
  "WebStoreCode":null,
  "WebStoreInstanceCode":null,
  "IsMoto":0,
  "LoyaltyPoints":null
}
`)

//use raw string in order to avoid JS removing the '\' characters
let log = String.raw`System.FormatException: Input string was not in a correct format.   at GlobalE.BL.Orders.CreateOrderQueueMessageProxy.CreateOrderBasedOnQueueMessage(AppSettingsBLProxy settings, IMerchantsBL merchants, CreateOrderQueueMessage message, IGELogger logger) in D:\jenkins\workspace\CORE_DanielTest\a4b75ddb5bc00e6051022ca6cbaf5173\BL\Orders\CreateOrderQueueMessageProxy.cs:line 54
at GlobalE.QueueSubscribeService.Consumers.CreateOrderQueueMessageConsumer.Consume(CreateOrderQueueMessage message) in D:\jenkins\workspace\CORE_DanielTest\a4b75ddb5bc00e6051022ca6cbaf5173\GlobalE.QueueSubscribeService\Consumers\CreateOrderQueueMessageConsumer.cs:line 118`;

setupStackTraceViewer(document.querySelector('#stackTraceViewer'), log);
