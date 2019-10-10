import atob from 'atob';
import btoa from 'btoa';
import mockResponseForSeatSchema from './getSeatingPlanScheme';

suite('Booking flow test', function () {
    test('Mock the response sample', async() => {

        browser.url('');
        browser.maximizeWindow();
        const searchTextBox = $('#EventNameToSearchTb');
        searchTextBox.setValue("Mamma Mia!")
        const searchButton = $('.ltd-button--success');
        searchButton.click();
        
        const showName = $('#event-title');
        showName.waitForExist();
        const bookTickets = $('.ltd-cta__row')
        bookTickets.click();

        const header = $('.booking-calendar__navigation__heading');
        header.waitForExist();
     
        const bookingTicketForToday = $('.booking-calendar__link__row');
        bookingTicketForToday.click();

        browser.cdp('Network', 'enable'); //Enable the CDP Domain
        browser.cdp('Network', 'setRequestInterception', {
            patterns:
                [{
                    urlPattern: '*/GetSeatingPlanScheme.ashx?*',
                    resourceType: 'Document',
                    interceptionStage: 'HeadersReceived'
                }]
        }
        );

//Another call to mock - GetSeatingPlanAvailability.ashx?

        browser.on('Network.requestIntercepted', async (params) => {
            console.log('URL Intercepted - ',params.request.url);

            const response = await browser.cdp('Network', 'getResponseBodyForInterception', {
                interceptionId: params.interceptionId,
            });

            const bodyData = response.base64Encoded ? atob(response.body) : response.body;
             console.log(bodyData);

            const newHeaders = [
                'Connection: closed',
                'Content-Length: ' + mockResponse.length,
                'Content-Type: application/json;charset=UTF-8'
            ];

            await browser.cdp('Network', 'continueInterceptedRequest', {
                interceptionId: params.interceptionId,
                rawResponse: btoa('HTTP/1.1 200 OK' + '\r\n' + newHeaders.join('\r\n') + '\r\n\r\n' + JSON.stringify(mockResponse))
            });
        });


        const canvas = $('.ltd-seatplan__canvas');
        canvas.waitForExist();
       
        canvas.moveTo(1129.42,490.28);
        browser.pause(10000);
        canvas.click();

        const addToBasket = $('.seat-plan__submit__button');
        addToBasket.waitForExist(5000);
        addToBasket.click();

        const checkOutPage = $('.page-header__row page-header__heading')
        console.log('waiting for checkout Page');
        checkOutPage.waitForExist();

        
       // browser.url('https://www.londontheatredirect.com/Handlers/GetSeatingPlanPerformances.ashx?performanceId=524778&direction=0');
        
        browser.pause(10000);
    });

});