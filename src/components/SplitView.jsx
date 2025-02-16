import { Button } from 'path/to/ui-library';
import { ArrowRight } from 'path/to/icons';

...

<Button
  variant="outline"
  className="flex-1 h-10 text-base font-medium"
  onClick={() => {
    if (step === 1) {
      onCancel();
    } else {
      dispatch({ type: 'SET_STEP', step: 1 });
    }
  }}
>
  {step === 1 ? 'Cancel' : 'Back'}
</Button>
<Button
  className="flex-1 h-10 text-base font-medium bg-blue-600 hover:bg-blue-700"
  onClick={() => {
    if (step === 1) {
      dispatch({ type: 'SET_STEP', step: 2 });
    } else {
      onSave();
    }
  }}
>
  {step === 1 ? (
    <>
      Review
      <ArrowRight className="ml-2 h-4 w-4" />
    </>
  ) : (
    'Confirm Split'
  )}
</Button>

...