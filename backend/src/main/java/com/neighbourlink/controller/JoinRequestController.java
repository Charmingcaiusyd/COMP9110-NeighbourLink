package com.neighbourlink.controller;

import com.neighbourlink.dto.JoinRequestCreateRequestDto;
import com.neighbourlink.dto.JoinRequestCreatedResponseDto;
import com.neighbourlink.dto.JoinRequestDecisionRequestDto;
import com.neighbourlink.dto.JoinRequestDecisionResponseDto;
import com.neighbourlink.dto.PendingJoinRequestItemDto;
import com.neighbourlink.dto.RiderJoinRequestHistoryItemDto;
import com.neighbourlink.service.JoinRequestService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class JoinRequestController {

    private final JoinRequestService joinRequestService;

    public JoinRequestController(JoinRequestService joinRequestService) {
        this.joinRequestService = joinRequestService;
    }

    @PostMapping("/join-requests")
    @ResponseStatus(HttpStatus.CREATED)
    public JoinRequestCreatedResponseDto submitJoinRequest(@RequestBody JoinRequestCreateRequestDto request) {
        return joinRequestService.submitJoinRequest(request);
    }

    @GetMapping("/drivers/{driverId}/join-requests/pending")
    public List<PendingJoinRequestItemDto> getPendingJoinRequests(@PathVariable Long driverId) {
        return joinRequestService.getPendingByDriver(driverId);
    }

    @GetMapping("/riders/{riderId}/join-requests")
    public List<RiderJoinRequestHistoryItemDto> getRiderJoinRequestHistory(@PathVariable Long riderId) {
        return joinRequestService.getHistoryByRider(riderId);
    }

    @PatchMapping("/drivers/{driverId}/join-requests/{joinRequestId}/decision")
    public JoinRequestDecisionResponseDto decideJoinRequest(
            @PathVariable Long driverId,
            @PathVariable Long joinRequestId,
            @RequestBody JoinRequestDecisionRequestDto request
    ) {
        return joinRequestService.decideJoinRequest(
                driverId,
                joinRequestId,
                request == null ? null : request.getDecision(),
                request == null ? null : request.getMeetingPoint()
        );
    }
}
