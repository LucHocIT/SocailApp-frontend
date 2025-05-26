import React from 'react';
import { Placeholder, Stack } from 'react-bootstrap';

const ReactionUsersSkeleton = ({ count = 5 }) => {
  return (
    <>
      {[...Array(count)].map((_, index) => (
        <div key={index} className="reaction-user-item rounded mb-2 p-2">
          <div className="d-flex align-items-center">
            <Placeholder animation="glow" roundedCircle style={{ width: 48, height: 48 }} />
            <div className="ms-3 flex-grow-1">
              <Stack>
                <Placeholder animation="glow">
                  <Placeholder xs={6} />
                </Placeholder>
                <Placeholder animation="glow">
                  <Placeholder xs={4} />
                </Placeholder>
              </Stack>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default ReactionUsersSkeleton;
