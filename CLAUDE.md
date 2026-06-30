I need to add the calculations for Asset Depreciation. 

Please note that the depreciation rates of an asset is defined by the organisation for every asset category. 

So under the "Asset Category Management" page, when you click an "Configure Fields", please add an option for one to add the value of annual depreciation rate of an asset category. Like for example "33.33%" which is the annual depreciation for assets under the computer category.

So this is the detail of how the Depreciation is done.

This will be displayed automatically based on the Assest Purchase Cost on this page (http://localhost:3000/assets-mgt/assets/general/2/update/8)

We will display the following information.

Depreciation Rate.
Detail Net Book Value
Accumulated Depreciation. use the field of Net Value to show the Accumulated Depreciation.

Here are the calculations.

Very important to take the date the asset was purchased.

Dep Rate = 33.33 % (for example) defined from "Configure Fields"
Dep Amount per Year = Purchase Cost (Dep Rate / 100). For example purchase Cost ( 33.33 / 100)
Dep Amount per Month = (Dep Amount per Year) / 12.

Accumulated Depreciation = summation of all depreciations done on every month.

Please note this very important aspect about depreciations. Its value will change after every year. (Please note the year we are talking about here is based on the date the asset was bought. So if an asset is bought in may 2026, it will make a year in may 2027)

Here is an example.

if the deprecition rate of a computer category is 33.33 % for example.

First Year 
Purchase Cost = 5,000,000 UGX = Detail Net Book Value. 

Dep Amount per year = 5000000 (33.33 / 100) = 1,666,500
Dep Amount per month = 1,666,500/ 12 = 138,875

So this value 138,875 will be the depreciation amount for every month for the first year on the asset making a total of yearly dep amount of 1,666,500.

Second Year.

Detail Net Book Value = 5,000,000 - 1,666,500 = 3,333,500 UGX

Dep Amount per year of the second year = 3333500 (33.33 / 100) = 1,111,055.55 UGX
Dep Amount per month of the second year = 1,111,055.55/ 12 = 92,587.9625 UGX

So the Accumulated Depreciation in the second month of the second year should be 

= 1,666,500 + (Dep Amount per month of the second year * 2 )

Please let me know if this make any sense.

Then also there is the usefull life of an asset. If the asset has totally depleted, it should move to disposal status. 