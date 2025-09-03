# Delivery Requirements & Restrictions - Client Questionnaire

## Geographic Boundaries

### Coverage Area
1. **Primary Service Area**
   - Should we use Travis County as the base service area?
   - Or a radius-based system (e.g., 50 miles from Austin city center)?
   - What specific zip codes should we definitely include?
   - What specific zip codes should we definitely exclude?

2. **Delivery Zones & Pricing**
   - Do you want different delivery fees for different zones?
     - Zone 1 (0-10 miles): $X delivery fee
     - Zone 2 (10-25 miles): $X delivery fee  
     - Zone 3 (25-50 miles): $X delivery fee
   - Any areas that require special handling or higher fees?
   - Any VIP areas with free/reduced delivery?

3. **Address Restrictions**
   - Any specific venue types we should NOT deliver to?
     - College dorms?
     - Hospitals?
     - Government buildings?
     - Hotels/Airbnbs?
   - Any areas with additional ID/verification requirements?

## Time Restrictions

### Operating Hours
1. **Standard Delivery Windows**
   - What are your standard delivery hours? (e.g., 10am - 10pm)
   - Different hours for different days?
     - Monday-Thursday: _____ to _____
     - Friday: _____ to _____
     - Saturday: _____ to _____
     - Sunday: _____ to _____

2. **Holiday Schedule**
   - Closed on which holidays?
   - Modified hours for which holidays?
   - Peak season surcharges?

3. **Advance Notice Requirements**
   - Current: 72-hour advance notice for all orders
   - Should this vary by order size or location?
   - Express delivery windows and fees?
   - Same-day cutoff times?

### Time Slot Management
1. **Delivery Windows**
   - How long should each delivery window be? (2 hours, 3 hours, etc.)
   - Maximum deliveries per time slot?
   - Should we show "sold out" time slots?

## Order Restrictions

### Minimum Orders
1. **By Zone**
   - Zone 1 minimum: $____
   - Zone 2 minimum: $____
   - Zone 3 minimum: $____

2. **By Time**
   - Higher minimums for peak times (Friday/Saturday night)?
   - Lower minimums for off-peak?

### Maximum Orders
1. **Inventory Limits**
   - Maximum quantity per product?
   - Maximum total order value?

## Special Circumstances

### Event Types
1. **Large Events**
   - Definition of "large event" (# of people or order value)?
   - Special requirements or fees?
   - Dedicated account manager threshold?

2. **Recurring Deliveries**
   - Support for weekly/monthly standing orders?
   - Corporate account requirements?

### Legal/Compliance
1. **Age Verification**
   - Delivery to 21+ only locations (bars, venues)?
   - ID verification process at delivery?
   - Multiple ID checks for group orders?

2. **Permit Requirements**
   - Any areas requiring special permits?
   - TABC restricted areas?

## System Behavior

### Out of Area Handling
1. **What happens when someone enters an address outside the delivery area?**
   - Show error immediately?
   - Suggest nearest serviceable address?
   - Collect lead for future expansion?
   - Allow them to submit request for review?

2. **Edge Cases**
   - New construction/addresses not in database?
   - Rural addresses with unclear boundaries?
   - Temporary event venues?

### Communication
1. **Customer Notifications**
   - When should we notify about delivery restrictions?
     - During product browsing?
     - At cart?
     - At checkout?
   
2. **Messaging**
   - Preferred language for "out of area" message?
   - How to handle disappointed customers?

## Technical Implementation Preferences

1. **Address Validation**
   - Use Google Maps API for validation?
   - Manual override capability needed?
   - Store delivery history for faster future orders?

2. **Real-time Updates**
   - Should delivery availability update in real-time?
   - Show "X slots remaining" for popular times?
   - Allow waitlist for sold-out slots?

## Future Considerations

1. **Expansion Plans**
   - Planning to expand to other Texas cities?
   - Timeline for expansion?
   - Should system be built to easily add new regions?

2. **Integration Needs**
   - Integration with delivery fleet management?
   - Third-party delivery services (DoorDash, Uber)?
   - Route optimization software?

---

## Additional Information Needed

Please provide:
1. List of currently serviced zip codes (if available)
2. Any existing delivery zone maps
3. Historical data on problem areas or addresses
4. Competitor delivery areas (for reference)
5. Any legal documents regarding delivery restrictions
6. Current insurance coverage areas

## Priority Order

Please rank these features by priority (1 = must have for launch, 2 = nice to have, 3 = future enhancement):
- [ ] Zip code validation
- [ ] Radius-based validation  
- [ ] Zone-based pricing
- [ ] Time slot inventory management
- [ ] Holiday/special hours
- [ ] Express delivery options
- [ ] Address blacklist/whitelist
- [ ] Recurring delivery support
- [ ] Real-time slot availability
- [ ] Route optimization