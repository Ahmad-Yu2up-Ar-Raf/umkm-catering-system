<?php

test('health check responds ok', function () {
    $response = $this->get('/up');

    $response->assertOk();
});
