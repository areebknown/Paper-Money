# Inventory Page Structure And Layout

**Attached Pages**

1. `bidwarsui.html` file in `/Downloads`
2. `bid wars rank icons` folder in `/Downloads`
3. `Rank System.pdf` file in `/Downloads`

**Task**

Note: The following changes/updates are only for the inventory page. Which is currently replaced by a place holder fake inventory page. The following layout is only for the body of the inventory page, do now copy paste the functionality of the `bidwarsui.html` file for header and bottom nav bar, instead keep them as same as current production home page's header and bottom nav bar.

Start with referencing to `bidwarsui.html` file for UI for the inventory page. Do not copy any functionality from the `bidwarsui.html` file for the home page, just keep it as same as it is right now for home page.

- On on top of the page will be a header with the title `"(username)'s Inventory"` just as the `bidwarsui.html` file.
- Below that, on page will be mutiple sections stacked up to showcase user's owned items, styling same as the `bidwarsui.html` file.
- The order of the sections will be like this, two section headings stacked horizontally "Total Balance" and "Rank Points" (these are not in the reference file, add these extra) with their following cards displaying this information, i.e. just like on the `/Invest` page, they below these two will be two more horizontally stacked section headings "Owned Estate" and "Owned Vehicles", with their cards below headings just like reference file, below these two will be a single section "Owned Resources" which will show the number of each item user has from Invest market,  which are 6 in total, i.e. Gold, Silver, Crude, etc.
- Below that will be "Owned Artifacts" section which will display all the won artifacts as square cards stacked in 4x3 grid with on first load and then the lazy loading just same as the `/Home` page's Won Shutters load, you can copy that. Those small stacked cards will only display artifact's image primarily with their PID's and Tier and no other iformation.

**UI functionalities and some other information**

Balance Card
```
On initial load the balance card will just display the total money user has with a green rupee sign, with a small subtle light coloured text on bottom right `Tap to show Details` On tapping the card the height of the card will change and below the main balance text small information text appears stacked vertically, Loan Amount (it will tell how much money out of total balance is a loan), Green Money (it is a special kind of money which will be given to new accounts and will only be able to bid and buy shutters, users will not be able to pay this money to each other or invest it in market, as they might exploit this new account new money feature to gain infinite money glitch, however money earned using selling those bid items or received from other users will be normal money, eventually all the green money will get used up as user pays more and more from it and receives normal money), Invested Money (the amount invested in market), Net Worth (calculated via combining, costs of all products from consumer market(estates and vehicles) and total money(which displays on home page on top left) and invested money). Tapping again will shrink back the card to its original state and hence changing the whole content below resposively to it, make sure the animation is very smooth and dont make the balance texts that big that it wont even fit the card, keep them small enough so a 9-10 digit number can be displayed in the card without any overflow and with some padding around it
```
Rank Card
```
On rank card will display user's rank and rank points, on the basis of `Rank System.pdf` to see at which point range what rank will user be on, and when that is clear, his rank icon's SVG will be taken from `bid wars rank icons` folder. Make sure to fit the rank icon quite well on the card with rank points on left. On tapping the rank icon, user will be redirected to Rank page which is under development so you can create a tiny place holder for now while tapping on the card itself or rank points will expand the card as same as the balance card to show the rank perks for that particular rankas per the `Rank System.pdf`, "Loan Tokens:" and "Coupons:" with a small see more perks text which will also redirect them to rank page. 
```
Owned Estates, Vehicles and Owned Resources
```
Only show card for estates and vehicles when there any estate or vehicle owned by the user, if there's no estate or vehicle owned by the user, then don't show the card, same goes for resources, if user has no resources, don't show the card just the blue heading with a text below "No Owned Items", make sure to remove the card of the resouce if all of it has been sold in the market, it shouldnt sit there with the zero value.
```
Owned Artifacts
```
Add a search and  filter icon on right of the heading "Owned Artifacts", on tapping filter, ir will open a bottom sheet with filter options, i.e. sorting the artifacts on basis of their tier, type(artifact, set) and on tapping search icon, it will open a search bar to search through PID.
make sure to reduce the size of the artifact images through cloudinary to optimise the page for large number of artifact images, as they are very small in this card view merely as watermarks, use fauto or any other technique to reduce the size of the images by analysing what size will be good for this layout, not too bad not too good.
