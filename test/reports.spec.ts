import { IntervalPagerImpl, IntervalType } from '../src/app/reports'

/* 
                                          2022
             April                         May                         June            
                                                                                         
  Mon Tue Wed Thu Fri Sat Sun  Mon Tue Wed Thu Fri Sat Sun  Mon Tue Wed Thu Fri Sat Sun  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━  ━━━━━━━━━━━━━━━━━━━━━━━━━━━  ━━━━━━━━━━━━━━━━━━━━━━━━━━━  
                    1   2   3                            1            1   2   3   4   5 
    4   5   6   7   8   9  10    2   3   4   5   6   7   8    6   7   8   9  10  11  12 
   11  12  13  14  15  16  17    9  10  11  12  13  14  15   13  14  15  16  17  18  19 
   18  19  20  21  22  23  24   16  17  18  19  20  21  22   20  21  22  23  24  25  26 
   25  26  27  28  29  30       23  24  25  26  27  28  29   27  28  29  30             
                                30  31   
*/
describe('Interval pager calculation for week', () => {
    test('Should calculate current', () => {
        const intervalPage = IntervalPagerImpl.create(
            IntervalType.Weekly,
            new Date(2022, 4, 17, 16, 0, 0)
        )
        expect(intervalPage.current().start.toString()).toBe(
            new Date(2022, 4, 16, 0, 0, 0).toString()
        )
        expect(intervalPage.current().end.toString()).toBe(
            new Date(2022, 4, 22, 23, 59, 59).toString()
        )
    })
    test('Should calculate next week', () => {
        const intervalPage = IntervalPagerImpl.create(
            IntervalType.Weekly,
            new Date(2022, 4, 17, 16, 0, 0)
        )
        expect(intervalPage.next().current().start.toString()).toBe(
            new Date(2022, 4, 23, 0, 0, 0).toString()
        )
        expect(intervalPage.next().current().end.toString()).toBe(
            new Date(2022, 4, 29, 23, 59, 59).toString()
        )
    })

    test('Should calculate prev week', () => {
        const intervalPage = IntervalPagerImpl.create(
            IntervalType.Weekly,
            new Date(2022, 4, 17, 16, 0, 0)
        )
        expect(intervalPage.prev().current().start.toString()).toBe(
            new Date(2022, 4, 9, 0, 0, 0).toString()
        )
        expect(intervalPage.prev().current().end.toString()).toBe(
            new Date(2022, 4, 15, 23, 59, 59).toString()
        )
    })
})

describe('Interval pager calculation for month', () => {
    test('Should calculate current', () => {
        const intervalPage = IntervalPagerImpl.create(
            IntervalType.Monthly,
            new Date(2022, 4, 17, 16, 0, 0)
        )
        expect(intervalPage.current().start.toString()).toBe(
            new Date(2022, 4, 1, 0, 0, 0).toString()
        )
        expect(intervalPage.current().end.toString()).toBe(
            new Date(2022, 4, 31, 23, 59, 59).toString()
        )
    })
    test('Should calculate next month', () => {
        const intervalPage = IntervalPagerImpl.create(
            IntervalType.Monthly,
            new Date(2022, 4, 17, 16, 0, 0)
        )
        expect(intervalPage.next().current().start.toString()).toBe(
            new Date(2022, 5, 1, 0, 0, 0).toString()
        )
        expect(intervalPage.next().current().end.toString()).toBe(
            new Date(2022, 5, 30, 23, 59, 59).toString()
        )
    })

    test('Should calculate prev month', () => {
        const intervalPage = IntervalPagerImpl.create(
            IntervalType.Monthly,
            new Date(2022, 4, 17, 16, 0, 0)
        )
        expect(intervalPage.prev().current().start.toString()).toBe(
            new Date(2022, 3, 1, 0, 0, 0).toString()
        )
        expect(intervalPage.prev().current().end.toString()).toBe(
            new Date(2022, 3, 30, 23, 59, 59).toString()
        )
    })
})
