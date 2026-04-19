package com.neighbourlink;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Sql(scripts = "/test-data.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
class UseCaseFlowIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void uc2_riderJoinRequestHistory_shouldShowPendingAndRejectedStates() throws Exception {
        MvcResult createJoinResult = mockMvc.perform(post("/api/join-requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"rideOfferId\":101,\"riderId\":3,\"requestedSeats\":1}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andReturn();

        Long joinRequestId = extractLong(createJoinResult, "joinRequestId");

        mockMvc.perform(get("/api/riders/3/join-requests"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].joinRequestId").value(joinRequestId))
                .andExpect(jsonPath("$[0].rideOfferId").value(101))
                .andExpect(jsonPath("$[0].driverId").value(1))
                .andExpect(jsonPath("$[0].driverName").value("Emma Lee"))
                .andExpect(jsonPath("$[0].status").value("PENDING"));

        mockMvc.perform(patch("/api/drivers/1/join-requests/{joinRequestId}/decision", joinRequestId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"decision\":\"REJECTED\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("REJECTED"));

        mockMvc.perform(get("/api/riders/3/join-requests"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].joinRequestId").value(joinRequestId))
                .andExpect(jsonPath("$[0].status").value("REJECTED"));
    }

    @Test
    void searchRideOffers_strictSuburbAndDate_shouldReturnExactSuburbResult() throws Exception {
        mockMvc.perform(get("/api/ride-offers")
                        .param("origin", "Clayton")
                        .param("destination", "Docklands")
                        .param("departureDate", "2026-04-09")
                        .param("passengerCount", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].offerId").value(104))
                .andExpect(jsonPath("$[0].destination").value("Docklands"))
                .andExpect(jsonPath("$[0].availableSeats").value(2));
    }

    @Test
    void searchRideOffers_strictSuburb_shouldNotUseSynonymAlias() throws Exception {
        mockMvc.perform(get("/api/ride-offers")
                        .param("origin", "Clayton")
                        .param("destination", "Melbourne")
                        .param("departureDate", "2026-04-09")
                        .param("passengerCount", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void searchRideOffers_timeWindow_shouldRespectConfiguredFlexHours() throws Exception {
        mockMvc.perform(get("/api/ride-offers")
                        .param("origin", "Clayton")
                        .param("destination", "Docklands")
                        .param("departureDate", "2026-04-09")
                        .param("departureTime", "09:30")
                        .param("timeFlexHours", "1")
                        .param("passengerCount", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].offerId").value(104));

        mockMvc.perform(get("/api/ride-offers")
                        .param("origin", "Clayton")
                        .param("destination", "Docklands")
                        .param("departureDate", "2026-04-09")
                        .param("departureTime", "15:30")
                        .param("timeFlexHours", "1")
                        .param("passengerCount", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void searchRideOffers_timeWindowAboveSixHours_shouldReturnBadRequest() throws Exception {
        mockMvc.perform(get("/api/ride-offers")
                        .param("origin", "Clayton")
                        .param("destination", "Docklands")
                        .param("departureDate", "2026-04-09")
                        .param("departureTime", "09:30")
                        .param("timeFlexHours", "7")
                        .param("passengerCount", "1"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("timeFlexHours must be between 0 and 6"));
    }

    @Test
    void uc2_joinRequestDecisionFlow_shouldCreateMatchAndUpdateSeats() throws Exception {
        MvcResult createJoinResult = mockMvc.perform(post("/api/join-requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"rideOfferId\":101,\"riderId\":3,\"requestedSeats\":1}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andReturn();

        Long joinRequestId = extractLong(createJoinResult, "joinRequestId");

        mockMvc.perform(patch("/api/drivers/1/join-requests/{joinRequestId}/decision", joinRequestId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"decision\":\"ACCEPTED\",\"meetingPoint\":\"Clayton Station Gate 2\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACCEPTED"))
                .andExpect(jsonPath("$.rideMatchId").isNumber())
                .andExpect(jsonPath("$.updatedAvailableSeats").value(1));

        mockMvc.perform(get("/api/ride-offers/101"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.availableSeats").value(1))
                .andExpect(jsonPath("$.status").value("OPEN"));
    }

    @Test
    void uc2_acceptDecisionWithoutMeetingPoint_shouldReturnBadRequest() throws Exception {
        MvcResult createJoinResult = mockMvc.perform(post("/api/join-requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"rideOfferId\":101,\"riderId\":3,\"requestedSeats\":1}"))
                .andExpect(status().isCreated())
                .andReturn();
        Long joinRequestId = extractLong(createJoinResult, "joinRequestId");

        mockMvc.perform(patch("/api/drivers/1/join-requests/{joinRequestId}/decision", joinRequestId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"decision\":\"ACCEPTED\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("meetingPoint is required when decision is ACCEPTED"));
    }

    @Test
    void driver_createRideOffer_shouldSucceedAndAppearInDriverList() throws Exception {
        MvcResult createOfferResult = mockMvc.perform(post("/api/ride-offers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"driverId\":1,\"origin\":\"Clayton\",\"originAddress\":\"Clayton Station\",\"originSuburb\":\"Clayton\","
                                + "\"originLatitude\":-37.9241,\"originLongitude\":145.1207,"
                                + "\"destination\":\"Melbourne\",\"destinationAddress\":\"Melbourne CBD\",\"destinationSuburb\":\"Melbourne\","
                                + "\"destinationLatitude\":-37.8136,\"destinationLongitude\":144.9631,"
                                + "\"departureDate\":\"2026-04-12\",\"departureTime\":\"07:45\",\"availableSeats\":2}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.offerId").isNumber())
                .andExpect(jsonPath("$.status").value("OPEN"))
                .andReturn();

        Long createdOfferId = extractLong(createOfferResult, "offerId");

        mockMvc.perform(get("/api/drivers/1/ride-offers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].offerId").value(createdOfferId))
                .andExpect(jsonPath("$[0].origin").value("Clayton"))
                .andExpect(jsonPath("$[0].destination").value("Melbourne"))
                .andExpect(jsonPath("$[0].availableSeats").value(2))
                .andExpect(jsonPath("$[0].status").value("OPEN"));
    }

    @Test
    void uc2_acceptJoinRequest_shouldCreateNotificationsForBothSides() throws Exception {
        MvcResult createJoinResult = mockMvc.perform(post("/api/join-requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"rideOfferId\":101,\"riderId\":3,\"requestedSeats\":1}"))
                .andExpect(status().isCreated())
                .andReturn();
        Long joinRequestId = extractLong(createJoinResult, "joinRequestId");

        mockMvc.perform(patch("/api/drivers/1/join-requests/{joinRequestId}/decision", joinRequestId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"decision\":\"ACCEPTED\",\"meetingPoint\":\"Clayton Station Gate 2\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACCEPTED"))
                .andExpect(jsonPath("$.rideMatchId").isNumber());

        MvcResult riderNotificationResult = mockMvc.perform(get("/api/users/3/notifications")
                        .param("unreadOnly", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].type").value("RIDE_MATCH_CONFIRMED"))
                .andExpect(jsonPath("$[0].read").value(false))
                .andReturn();
        Long riderNotificationId = extractLongFromArray(riderNotificationResult, 0, "notificationId");

        mockMvc.perform(patch("/api/users/3/notifications/{notificationId}/read", riderNotificationId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.notificationId").value(riderNotificationId))
                .andExpect(jsonPath("$.read").value(true));

        mockMvc.perform(get("/api/users/1/notifications")
                        .param("unreadOnly", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].type").value("RIDE_MATCH_CONFIRMED"));

        mockMvc.perform(patch("/api/users/1/notifications/read-all"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.updatedCount").value(2));
    }

    @Test
    void uc3_oneOffFlow_shouldAcceptOnlyOneFinalOffer() throws Exception {
        MvcResult createRequestResult = mockMvc.perform(post("/api/ride-requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"riderId\":4,\"origin\":\"Clayton\",\"destination\":\"Community Hall\",\"tripDate\":\"2026-03-21\",\"tripTime\":\"11:15\",\"passengerCount\":2,\"notes\":\"Main flow test\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("OPEN"))
                .andReturn();

        Long rideRequestId = extractLong(createRequestResult, "rideRequestId");

        MvcResult offerOneResult = mockMvc.perform(post("/api/ride-requests/{rideRequestId}/offers", rideRequestId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"driverId\":1,\"proposedSeats\":2,\"meetingPoint\":\"Clayton Station\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andReturn();
        Long offerOneId = extractLong(offerOneResult, "offerId");

        MvcResult offerTwoResult = mockMvc.perform(post("/api/ride-requests/{rideRequestId}/offers", rideRequestId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"driverId\":2,\"proposedSeats\":2,\"meetingPoint\":\"Clayton Library\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andReturn();
        Long offerTwoId = extractLong(offerTwoResult, "offerId");

        mockMvc.perform(patch("/api/riders/4/ride-requests/{rideRequestId}/offers/{offerId}/accept", rideRequestId, offerOneId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rideRequestId").value(rideRequestId))
                .andExpect(jsonPath("$.acceptedOfferId").value(offerOneId))
                .andExpect(jsonPath("$.rideRequestStatus").value("MATCHED"));

        mockMvc.perform(patch("/api/riders/4/ride-requests/{rideRequestId}/offers/{offerId}/accept", rideRequestId, offerTwoId))
                .andExpect(status().isConflict());

        MvcResult offersResult = mockMvc.perform(get("/api/riders/4/ride-requests/{rideRequestId}/offers", rideRequestId))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode offers = objectMapper.readTree(offersResult.getResponse().getContentAsString());

        String selectedStatus = null;
        String otherStatus = null;
        for (JsonNode offer : offers) {
            long offerId = offer.path("offerId").asLong();
            if (offerId == offerOneId) {
                selectedStatus = offer.path("status").asText();
            } else if (offerId == offerTwoId) {
                otherStatus = offer.path("status").asText();
            }
        }
        assertThat(selectedStatus).isEqualTo("ACCEPTED");
        assertThat(otherStatus).isEqualTo("REJECTED");
    }

    @Test
    void uc3_acceptOffer_shouldCreateNotificationsForRiderAndDrivers() throws Exception {
        MvcResult createRequestResult = mockMvc.perform(post("/api/ride-requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"riderId\":4,\"origin\":\"Box Hill\",\"destination\":\"Community Hall\",\"tripDate\":\"2026-03-25\",\"tripTime\":\"09:30\",\"passengerCount\":1,\"notes\":\"Notification test\"}"))
                .andExpect(status().isCreated())
                .andReturn();
        Long rideRequestId = extractLong(createRequestResult, "rideRequestId");

        MvcResult offerOneResult = mockMvc.perform(post("/api/ride-requests/{rideRequestId}/offers", rideRequestId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"driverId\":1,\"proposedSeats\":1,\"meetingPoint\":\"Box Hill Library\"}"))
                .andExpect(status().isCreated())
                .andReturn();
        Long offerOneId = extractLong(offerOneResult, "offerId");

        mockMvc.perform(post("/api/ride-requests/{rideRequestId}/offers", rideRequestId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"driverId\":2,\"proposedSeats\":1,\"meetingPoint\":\"Box Hill Station\"}"))
                .andExpect(status().isCreated())
                .andReturn();

        mockMvc.perform(patch("/api/riders/4/ride-requests/{rideRequestId}/offers/{offerId}/accept", rideRequestId, offerOneId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rideRequestStatus").value("MATCHED"));

        mockMvc.perform(get("/api/users/4/notifications")
                        .param("unreadOnly", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].type").value("RIDE_MATCH_CONFIRMED"));

        mockMvc.perform(get("/api/users/1/notifications")
                        .param("unreadOnly", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].type").value("RIDE_MATCH_CONFIRMED"));

        mockMvc.perform(get("/api/users/2/notifications")
                        .param("unreadOnly", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].type").value("RIDE_REQUEST_OFFER_REJECTED"));
    }

    @Test
    void uc3_acceptFlow_shouldAppearInTripsAndRequestHistory() throws Exception {
        MvcResult createRequestResult = mockMvc.perform(post("/api/ride-requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"riderId\":4,\"origin\":\"Box Hill\",\"destination\":\"Community Hall\",\"tripDate\":\"2026-03-25\",\"tripTime\":\"09:30\",\"passengerCount\":1,\"notes\":\"History test\"}"))
                .andExpect(status().isCreated())
                .andReturn();
        Long rideRequestId = extractLong(createRequestResult, "rideRequestId");

        MvcResult createOfferResult = mockMvc.perform(post("/api/ride-requests/{rideRequestId}/offers", rideRequestId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"driverId\":1,\"proposedSeats\":1,\"meetingPoint\":\"Box Hill Library\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andReturn();
        Long offerId = extractLong(createOfferResult, "offerId");

        MvcResult acceptResult = mockMvc.perform(patch("/api/riders/4/ride-requests/{rideRequestId}/offers/{offerId}/accept", rideRequestId, offerId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rideRequestStatus").value("MATCHED"))
                .andReturn();
        Long rideMatchId = extractLong(acceptResult, "rideMatchId");

        mockMvc.perform(get("/api/riders/4/trips"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].rideMatchId").value(rideMatchId))
                .andExpect(jsonPath("$[0].tripType").value("ONE_OFF_REQUEST"))
                .andExpect(jsonPath("$[0].meetingPoint").value("Box Hill Library"));

        mockMvc.perform(get("/api/riders/4/ride-requests"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].requestId").value(rideRequestId))
                .andExpect(jsonPath("$[0].status").value("MATCHED"))
                .andExpect(jsonPath("$[0].totalOffers").value(1))
                .andExpect(jsonPath("$[0].pendingOffers").value(0));
    }

    @Test
    void uc3_cancelOpenRequest_shouldCloseRequestAndRejectPendingOffers() throws Exception {
        MvcResult createRequestResult = mockMvc.perform(post("/api/ride-requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"riderId\":4,\"origin\":\"Doncaster\",\"destination\":\"Community Hall\",\"tripDate\":\"2026-03-24\",\"tripTime\":\"14:00\",\"passengerCount\":1}"))
                .andExpect(status().isCreated())
                .andReturn();
        Long rideRequestId = extractLong(createRequestResult, "rideRequestId");

        mockMvc.perform(post("/api/ride-requests/{rideRequestId}/offers", rideRequestId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"driverId\":1,\"proposedSeats\":1,\"meetingPoint\":\"Doncaster Library\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PENDING"));

        mockMvc.perform(patch("/api/riders/4/ride-requests/{rideRequestId}/cancel", rideRequestId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rideRequestId").value(rideRequestId))
                .andExpect(jsonPath("$.status").value("CLOSED"));

        MvcResult openResult = mockMvc.perform(get("/api/ride-requests/open"))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode openRequests = objectMapper.readTree(openResult.getResponse().getContentAsString());
        boolean stillOpen = false;
        for (JsonNode item : openRequests) {
            if (item.path("rideRequestId").asLong() == rideRequestId) {
                stillOpen = true;
                break;
            }
        }
        assertThat(stillOpen).isFalse();

        MvcResult offersResult = mockMvc.perform(get("/api/riders/4/ride-requests/{rideRequestId}/offers", rideRequestId))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode offers = objectMapper.readTree(offersResult.getResponse().getContentAsString());
        assertThat(offers.size()).isGreaterThan(0);
        assertThat(offers.get(0).path("status").asText()).isEqualTo("REJECTED");
    }

    @Test
    void uc3_cancelMatchedRequest_shouldReturnConflict() throws Exception {
        MvcResult createRequestResult = mockMvc.perform(post("/api/ride-requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"riderId\":4,\"origin\":\"Box Hill\",\"destination\":\"CBD\",\"tripDate\":\"2026-03-26\",\"tripTime\":\"09:45\",\"passengerCount\":1}"))
                .andExpect(status().isCreated())
                .andReturn();
        Long rideRequestId = extractLong(createRequestResult, "rideRequestId");

        MvcResult createOfferResult = mockMvc.perform(post("/api/ride-requests/{rideRequestId}/offers", rideRequestId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"driverId\":1,\"proposedSeats\":1,\"meetingPoint\":\"Box Hill Station\"}"))
                .andExpect(status().isCreated())
                .andReturn();
        Long offerId = extractLong(createOfferResult, "offerId");

        mockMvc.perform(patch("/api/riders/4/ride-requests/{rideRequestId}/offers/{offerId}/accept", rideRequestId, offerId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rideRequestStatus").value("MATCHED"));

        mockMvc.perform(patch("/api/riders/4/ride-requests/{rideRequestId}/cancel", rideRequestId))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Matched ride request cannot be cancelled"));
    }

    @Test
    void auth_registerAndLogin_shouldWorkWithHashedCredentialStorage() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"fullName\":\"Alex Green\",\"email\":\"alex@example.com\",\"password\":\"demo1234\",\"role\":\"RIDER\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("alex@example.com"))
                .andExpect(jsonPath("$.role").value("RIDER"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"alex@example.com\",\"password\":\"demo1234\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("alex@example.com"))
                .andExpect(jsonPath("$.role").value("RIDER"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"maria.rider@example.com\",\"password\":\"demo1234\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("maria.rider@example.com"))
                .andExpect(jsonPath("$.role").value("RIDER"));
    }

    @Test
    void auth_registerDriverWithoutDocuments_shouldReturnBadRequest() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"fullName\":\"Driver NoDocs\",\"email\":\"driver.nodocs@example.com\",\"password\":\"demo1234\",\"role\":\"DRIVER\",\"driverVehicleInfo\":\"Toyota\",\"driverSpareSeatCapacity\":3}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Driver registration requires driverLicenceFile, spareSeatCapacityProofFile, and vehicleRegoFile"));
    }

    @Test
    void auth_registerDriverWithDocuments_shouldSucceed() throws Exception {
        MockMultipartFile payload = new MockMultipartFile(
                "payload",
                "payload.json",
                MediaType.APPLICATION_JSON_VALUE,
                ("{\"fullName\":\"Driver With Docs\",\"email\":\"driver.docs@example.com\",\"password\":\"demo1234\",\"role\":\"DRIVER\","
                        + "\"driverVehicleInfo\":\"Mazda 3 - Silver\",\"driverSpareSeatCapacity\":3}")
                        .getBytes(StandardCharsets.UTF_8)
        );
        MockMultipartFile licence = new MockMultipartFile(
                "driverLicenceFile",
                "licence.pdf",
                MediaType.APPLICATION_PDF_VALUE,
                "fake licence".getBytes(StandardCharsets.UTF_8)
        );
        MockMultipartFile seatProof = new MockMultipartFile(
                "spareSeatCapacityProofFile",
                "seat-proof.pdf",
                MediaType.APPLICATION_PDF_VALUE,
                "fake seat proof".getBytes(StandardCharsets.UTF_8)
        );
        MockMultipartFile rego = new MockMultipartFile(
                "vehicleRegoFile",
                "rego.pdf",
                MediaType.APPLICATION_PDF_VALUE,
                "fake rego".getBytes(StandardCharsets.UTF_8)
        );

        mockMvc.perform(multipart("/api/auth/register")
                        .file(payload)
                        .file(licence)
                        .file(seatProof)
                        .file(rego))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("driver.docs@example.com"))
                .andExpect(jsonPath("$.role").value("DRIVER"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"driver.docs@example.com\",\"password\":\"demo1234\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("DRIVER"));
    }

    @Test
    void oneOffOffer_invalidRideRequestPath_shouldReturnReadableValidationMessage() throws Exception {
        mockMvc.perform(post("/api/ride-requests/undefined/offers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"driverId\":1,\"proposedSeats\":1,\"meetingPoint\":\"Library\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Parameter 'rideRequestId' must be a number"));
    }

    private Long extractLong(MvcResult result, String fieldName) throws Exception {
        JsonNode payload = objectMapper.readTree(result.getResponse().getContentAsString());
        return payload.path(fieldName).asLong();
    }

    private Long extractLongFromArray(MvcResult result, int index, String fieldName) throws Exception {
        JsonNode payload = objectMapper.readTree(result.getResponse().getContentAsString());
        return payload.path(index).path(fieldName).asLong();
    }
}
