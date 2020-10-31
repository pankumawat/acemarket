<H1>AceMarket</H1>
  <i>Ace City market place</i>

**TODO**
<ol>
  <li>Password is currently bypassed, UNDO that.</li>
  <li>Add indexing to username, mid on merchant in incremental order. {unique: true}</li>
  <li>Add indexing to id on products in decremental order. {unique: true}</li>
  <li>Ensure duplicacy check while updating/adding products and merchants.</li>
</ol>

db.products.createIndex( { id: -1}, {unique:true} )
db.merchant.createIndex( { mid: -1}, {unique:true} )

Separate section for Services.

DELETE files incase of api failure..

pipe(
  getName,
  uppercase,
  get6Characters,
  reverse
)({ name: 'Buckethead' });
// 'TEKCUB'